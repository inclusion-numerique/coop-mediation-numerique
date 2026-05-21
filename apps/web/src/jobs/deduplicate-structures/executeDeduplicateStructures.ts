import { mergeStructure } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructure'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { Structure } from '@prisma/client'
import type { DeduplicateStructuresJob } from './deduplicateStructuresJob'

const scalarFieldsToEnrich = [
  'codeInsee',
  'complementAdresse',
  'latitude',
  'longitude',
  'banId',
  'rna',
  'presentationResume',
  'presentationDetail',
  'siteWeb',
  'telephone',
  'ficheAccesLibre',
  'horaires',
  'priseRdv',
  'structureParente',
  'nomReferent',
  'courrielReferent',
  'telephoneReferent',
] as const satisfies readonly (keyof Structure)[]

const findDuplicateGroups = async () =>
  prismaClient.structure.groupBy({
    by: ['siret', 'nom', 'adresse'],
    where: {
      suppression: null,
      siret: { not: null },
      nom: { not: '' },
      adresse: { not: '' },
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  })

const getFullStructuresForGroup = async (
  siret: string,
  nom: string,
  adresse: string,
) =>
  prismaClient.structure.findMany({
    where: { siret, nom, adresse, suppression: null },
    include: {
      _count: {
        select: {
          emplois: true,
          mediateursEnActivite: true,
        },
      },
    },
    orderBy: { modification: 'desc' },
  })

/**
 * Enrichit la cible avec les champs scalaires manquants des sources.
 * Les structures visibles pour la cartographie nationale sont prioritaires
 * comme donneuses de données, car elles ont en principe les champs les plus complets.
 */
const enrichTargetFromSources = async (
  target: Structure,
  sources: Structure[],
  dryRun: boolean,
) => {
  // Donneuses ordonnées : visibles pour carto d'abord, puis par date de modification desc
  const donors = [
    ...sources.filter((s) => s.visiblePourCartographieNationale),
    ...sources.filter((s) => !s.visiblePourCartographieNationale),
  ]

  const updates: Partial<
    Pick<Structure, (typeof scalarFieldsToEnrich)[number]>
  > = {}

  for (const field of scalarFieldsToEnrich) {
    if (target[field] == null || target[field] === '') {
      const donor = donors.find((d) => d[field] != null && d[field] !== '')
      if (donor) {
        ;(updates as any)[field] = donor[field]
      }
    }
  }

  const shouldBeVisible = sources.some(
    (s) => s.visiblePourCartographieNationale,
  )
  const visibilityUpdate =
    shouldBeVisible && !target.visiblePourCartographieNationale

  if (Object.keys(updates).length > 0 || visibilityUpdate) {
    const data = {
      ...updates,
      ...(visibilityUpdate ? { visiblePourCartographieNationale: true } : {}),
    }

    const enrichedFields = [
      ...Object.keys(updates),
      ...(visibilityUpdate ? ['visiblePourCartographieNationale'] : []),
    ]

    output.log(`  Enrichissement cible: ${enrichedFields.join(', ')}`)

    if (!dryRun) {
      await prismaClient.structure.update({
        where: { id: target.id },
        data,
      })
    }
  }
}

export const executeDeduplicateStructures = async (
  job: DeduplicateStructuresJob,
) => {
  const dryRun = job.payload?.dryRun ?? false

  output.log(`deduplicate-structures: starting${dryRun ? ' (DRY RUN)' : ''}...`)

  const duplicateGroups = await findDuplicateGroups()

  output.log(
    `deduplicate-structures: found ${duplicateGroups.length} groups of duplicates`,
  )

  if (duplicateGroups.length === 0) {
    return { dryRun, groupsFound: 0, mergesPerformed: 0 }
  }

  let mergesPerformed = 0

  for (const group of duplicateGroups) {
    const { siret, nom, adresse } = group

    const structures = await getFullStructuresForGroup(
      siret as string,
      nom,
      adresse,
    )

    const [target, ...sources] = structures

    output.log(
      `\n--- Groupe: SIRET=${siret} | Nom="${nom}" | Adresse="${adresse}" ---`,
    )
    output.log(`  ${structures.length} structures trouvées:`)

    for (const structure of structures) {
      const isTarget = structure.id === target.id
      const cartoFlag = structure.visiblePourCartographieNationale
        ? ' [CARTO]'
        : ''
      output.log(
        `  ${isTarget ? '→ CIBLE' : '  SOURCE'} id=${structure.id} | modifié=${structure.modification.toISOString()} | activités=${structure.activitesCount} | emplois=${structure._count.emplois} | médiateurs=${structure._count.mediateursEnActivite}${cartoFlag}`,
      )
    }

    await enrichTargetFromSources(target, sources, dryRun)

    if (!dryRun) {
      for (const source of sources) {
        output.log(`  Fusion: ${source.id} → ${target.id}`)
        await mergeStructure(source.id, target.id, { timeout: 30_000 })
        mergesPerformed++
      }
    } else {
      mergesPerformed += sources.length
    }
  }

  output.log(
    `\ndeduplicate-structures: ${dryRun ? 'would perform' : 'performed'} ${mergesPerformed} merges across ${duplicateGroups.length} groups`,
  )

  return {
    dryRun,
    groupsFound: duplicateGroups.length,
    mergesPerformed,
  }
}
