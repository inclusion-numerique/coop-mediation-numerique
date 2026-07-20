import { writeFile } from 'node:fs/promises'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { LinkEmployeusesMainJob } from './linkEmployeusesMainJob'

// Pose le `structure_coop_id` manquant sur `main.structure_administrative`, pour les
// employeuses coop que l'Entrepôt connaît déjà sans savoir qu'elles viennent de la coop.
//
// `structure_coop_id` est une colonne de CONSOLIDATION, pas une clé de propriété : une
// ligne `main` = une identité légale, qui accumule les identifiants de chaque source qui
// la connaît (`structure_ac_id`, `structure_tp_id`, `old_main_structure_id`…). Poser un
// `structure_coop_id` sur une ligne déjà connue d'Aidants Connect est donc le motif normal
// — c'est le cas de la grande majorité des liens existants.
//
// PIVOT — le SIRET identifie la personne morale, pas l'établissement : dans `main` un même
// SIRET porte souvent plusieurs antennes. Deux paliers seulement, tous deux non ambigus :
//   • `siret_1_1` : le SIRET ne désigne qu'une seule ligne `main` libre.
//   • `siege`     : plusieurs lignes libres, mais une seule sans `denomination_antenne`
//                   (le siège) -> c'est elle qui porte l'identité légale.
// Tout le reste (antennes seules, SIRET absent de `main`, employeuse sans SIRET) est
// laissé à l'arbitrage humain : lier une antenne au hasard poserait un lien faux et muet.
//
// La déduplication des employeuses coop (`deduplicate-employeuses`) doit précéder ce job :
// lier une orpheline dont la jumelle est déjà liée graverait le doublon dans `main`.

type Orpheline = {
  id: string
  siret: string | null
  nom: string
  commune: string
}

type LigneMainLibre = {
  id: number
  siret: string | null
  denomination_antenne: string | null
}

type Liaison = {
  orpheline: Orpheline
  mainId: number
  palier: 'siret_1_1' | 'siege'
}

const csvHeader = [
  'statut',
  'palier',
  'siret',
  'coop_id',
  'nom',
  'commune',
  'main_id',
].join(';')

const escapeCsvField = (field: string | number): string => {
  const value = String(field)
  return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

// Employeuses coop qu'aucune ligne `main` ne référence.
const findOrphelines = async (): Promise<Orpheline[]> => {
  const referencees = await entrepotPrismaClient.$queryRaw<
    { structure_coop_id: string }[]
  >`
    SELECT structure_coop_id
    FROM main.structure_administrative
    WHERE structure_coop_id IS NOT NULL
  `
  const referenceesIds = new Set(
    referencees.map(({ structure_coop_id }) => structure_coop_id),
  )

  const employeuses = await prismaClient.structureAdministrative.findMany({
    where: { suppression: null, siret: { not: null } },
    select: { id: true, siret: true, nom: true, commune: true },
  })

  return employeuses.filter(({ id }) => !referenceesIds.has(id))
}

// Lignes `main` encore disponibles : aucun `structure_coop_id` posé, non supprimées.
const findLignesMainLibres = async (): Promise<LigneMainLibre[]> =>
  entrepotPrismaClient.$queryRaw<LigneMainLibre[]>`
    SELECT id, siret, denomination_antenne
    FROM main.structure_administrative
    WHERE structure_coop_id IS NULL
      AND deleted_at IS NULL
      AND siret IS NOT NULL
  `

const groupBySiret = (
  lignes: LigneMainLibre[],
): Map<string, LigneMainLibre[]> =>
  lignes.reduce((groupes, ligne) => {
    const siret = ligne.siret ?? ''
    return groupes.set(siret, [...(groupes.get(siret) ?? []), ligne])
  }, new Map<string, LigneMainLibre[]>())

const resoudre =
  (libresParSiret: Map<string, LigneMainLibre[]>) =>
  (orpheline: Orpheline): Liaison | null => {
    const candidates = libresParSiret.get(orpheline.siret ?? '') ?? []

    if (candidates.length === 1) {
      return { orpheline, mainId: candidates[0].id, palier: 'siret_1_1' }
    }

    const sieges = candidates.filter(
      ({ denomination_antenne }) => denomination_antenne === null,
    )

    // Plusieurs antennes et un seul siège : le siège porte l'identité légale.
    if (candidates.length > 1 && sieges.length === 1) {
      return { orpheline, mainId: sieges[0].id, palier: 'siege' }
    }

    return null
  }

// Deux employeuses coop encore en doublon (SIRET partagé non dédupliqué) visent la même
// ligne `main` : lier l'une écraserait l'autre, silencieusement. On écarte le conflit.
const sansConflitDeCible = (liaisons: Liaison[]): Liaison[] => {
  const claimsParMainId = liaisons.reduce(
    (claims, { mainId }) => claims.set(mainId, (claims.get(mainId) ?? 0) + 1),
    new Map<number, number>(),
  )

  return liaisons.filter(({ mainId }) => claimsParMainId.get(mainId) === 1)
}

// L'UPDATE re-vérifie `structure_coop_id IS NULL` : si la ligne a été liée entre le calcul
// et l'écriture, on ne l'écrase pas — le compteur renvoyé vaut alors 0.
const poserLien = async ({ orpheline, mainId }: Liaison): Promise<boolean> => {
  const misesAJour = await entrepotPrismaClient.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_coop_id = ${orpheline.id}::uuid
    WHERE id = ${mainId}
      AND structure_coop_id IS NULL
  `
  return misesAJour === 1
}

export const executeLinkEmployeusesMain = async (
  job: LinkEmployeusesMainJob,
) => {
  const dryRun = job.payload?.dryRun ?? true
  const excludeSirets = new Set(job.payload?.excludeSirets ?? [])

  output.log(`link-employeuses-main: démarrage${dryRun ? ' (DRY RUN)' : ''}...`)

  const [orphelines, lignesLibres] = await Promise.all([
    findOrphelines(),
    findLignesMainLibres(),
  ])

  const libresParSiret = groupBySiret(lignesLibres)

  const resolues = orphelines
    .filter(({ siret }) => siret !== null && !excludeSirets.has(siret))
    .map(resoudre(libresParSiret))
    .filter((liaison): liaison is Liaison => liaison !== null)

  const liaisons = sansConflitDeCible(resolues)
  const conflits = resolues.length - liaisons.length

  output.log(
    `${orphelines.length} employeuses non référencées, ${liaisons.length} liables` +
      `${conflits > 0 ? ` (${conflits} écartées : cible disputée)` : ''}`,
  )

  const posees = dryRun
    ? []
    : await liaisons.reduce(
        async (precedent: Promise<Liaison[]>, liaison) => {
          const faites = await precedent
          const pose = await poserLien(liaison)
          return pose ? [...faites, liaison] : faites
        },
        Promise.resolve([] as Liaison[]),
      )

  const posesIds = new Set(posees.map(({ orpheline }) => orpheline.id))
  const statut = (liaison: Liaison) =>
    dryRun ? 'a_lier' : posesIds.has(liaison.orpheline.id) ? 'liee' : 'ignoree'

  const csvLines = liaisons.map((liaison) =>
    [
      statut(liaison),
      liaison.palier,
      liaison.orpheline.siret ?? '',
      liaison.orpheline.id,
      liaison.orpheline.nom,
      liaison.orpheline.commune,
      liaison.mainId,
    ]
      .map(escapeCsvField)
      .join(';'),
  )

  const filePath = getAuditOutputPath(
    `link-employeuses-main-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(filePath, [csvHeader, ...csvLines].join('\n'), 'utf-8')

  const parPalier = (palier: Liaison['palier']) =>
    liaisons.filter((liaison) => liaison.palier === palier).length

  output.log(
    `\n=== LIAISON EMPLOYEUSES -> MAIN ${dryRun ? '(DRY RUN)' : ''} ===`,
  )
  output.log(`Non référencées: ${orphelines.length}`)
  output.log(`  palier siret_1_1: ${parPalier('siret_1_1')}`)
  output.log(`  palier siege:     ${parPalier('siege')}`)
  output.log(`Écartées (cible disputée): ${conflits}`)
  output.log(
    `${dryRun ? 'À lier' : 'Liées'}: ${dryRun ? liaisons.length : posees.length}`,
  )
  output.log(`Export: ${filePath}`)
  output.log(`\nlink-employeuses-main: terminé`)

  return {
    dryRun,
    nonReferencees: orphelines.length,
    liables: liaisons.length,
    liees: dryRun ? 0 : posees.length,
    conflits,
    export: filePath,
  }
}
