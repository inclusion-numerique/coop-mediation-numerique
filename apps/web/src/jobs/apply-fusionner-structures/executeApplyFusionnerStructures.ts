import { writeFile } from 'node:fs/promises'
import { mergeStructure } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructure'
import {
  type ActionPlanRow,
  escapeCsvField,
  filterActionPlan,
  readActionPlan,
} from '@app/web/jobs/audit-csv'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { ApplyFusionnerStructuresJob } from './applyFusionnerStructuresJob'

const reviewCsvHeader = [
  'cluster_id',
  'role',
  'statut',
  'id',
  'nom',
  'adresse',
  'commune',
  'siret',
  'activites',
  'emplois',
  'mediateurs',
  'raison',
].join(';')

type ResultRow = {
  row: ActionPlanRow
  cibleId: string
  cibleNom: string
  cibleAdresse: string
  cibleCommune: string
  cibleSiret: string
  cibleActivites: number
  cibleEmplois: number
  cibleMediateurs: number
  statut: string
}

export const executeApplyFusionnerStructures = async (
  job: ApplyFusionnerStructuresJob,
) => {
  const { action } = job.payload
  const dryRun = job.payload.dryRun ?? true
  const excludeStructureIds = new Set(job.payload.excludeStructureIds ?? [])

  output.log(
    `apply-fusionner-structures: starting (${action})${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const actionPlan = await readActionPlan()
  const allToMerge = filterActionPlan(actionPlan, action)

  // Find every cluster that contains at least one excluded structure
  // (either as a source or as the merge target).
  const excludedClusterIds = new Set<string>()
  if (excludeStructureIds.size > 0) {
    for (const row of allToMerge) {
      if (
        excludeStructureIds.has(row.id) ||
        (row.cibleFusion && excludeStructureIds.has(row.cibleFusion))
      ) {
        excludedClusterIds.add(row.clusterId)
      }
    }
  }

  const toMerge = allToMerge.filter(
    (row) => !excludedClusterIds.has(row.clusterId),
  )
  const excludedCount = allToMerge.length - toMerge.length

  if (excludedClusterIds.size > 0) {
    output.log(
      `apply-fusionner-structures: ${excludedCount} structures exclues (${excludedClusterIds.size} clusters: ${[...excludedClusterIds].join(', ')})`,
    )
  }

  output.log(
    `apply-fusionner-structures: ${toMerge.length} structures à fusionner`,
  )

  if (toMerge.length === 0) {
    return { dryRun, action, total: 0, merged: 0, skipped: 0 }
  }

  const results: ResultRow[] = []
  let merged = 0
  let skipped = 0

  for (const [index, row] of toMerge.entries()) {
    if ((index + 1) % 50 === 0) {
      output.log(
        `apply-fusionner-structures: progress ${index + 1}/${toMerge.length}`,
      )
    }

    if (!row.cibleFusion) {
      output.log(
        `apply-fusionner-structures: SKIP ${row.id} — pas de cible de fusion`,
      )
      results.push({
        row,
        cibleId: '',
        cibleNom: '',
        cibleAdresse: '',
        cibleCommune: '',
        cibleSiret: '',
        cibleActivites: 0,
        cibleEmplois: 0,
        cibleMediateurs: 0,
        statut: 'skip_pas_de_cible',
      })
      skipped++
      continue
    }

    // Vérifier que source et cible existent encore
    const [source, cible] = await Promise.all([
      prismaClient.structure.findUnique({
        where: { id: row.id },
        select: { id: true, suppression: true },
      }),
      prismaClient.structure.findUnique({
        where: { id: row.cibleFusion },
        select: {
          id: true,
          nom: true,
          adresse: true,
          commune: true,
          siret: true,
          suppression: true,
          activitesCount: true,
          _count: {
            select: {
              emplois: true,
              mediateursEnActivite: true,
            },
          },
        },
      }),
    ])

    if (!source || source.suppression) {
      results.push({
        row,
        cibleId: row.cibleFusion,
        cibleNom: cible?.nom ?? '',
        cibleAdresse: cible?.adresse ?? '',
        cibleCommune: cible?.commune ?? '',
        cibleSiret: cible?.siret ?? '',
        cibleActivites: cible?.activitesCount ?? 0,
        cibleEmplois: cible?._count.emplois ?? 0,
        cibleMediateurs: cible?._count.mediateursEnActivite ?? 0,
        statut: 'skip_source_introuvable',
      })
      skipped++
      continue
    }

    if (!cible || cible.suppression) {
      output.log(
        `apply-fusionner-structures: SKIP ${row.id} — cible ${row.cibleFusion} introuvable ou supprimée`,
      )
      results.push({
        row,
        cibleId: row.cibleFusion,
        cibleNom: '',
        cibleAdresse: '',
        cibleCommune: '',
        cibleSiret: '',
        cibleActivites: 0,
        cibleEmplois: 0,
        cibleMediateurs: 0,
        statut: 'skip_cible_introuvable',
      })
      skipped++
      continue
    }

    const cibleInfo = {
      cibleId: row.cibleFusion,
      cibleNom: cible.nom,
      cibleAdresse: cible.adresse,
      cibleCommune: cible.commune,
      cibleSiret: cible.siret ?? '',
      cibleActivites: cible.activitesCount,
      cibleEmplois: cible._count.emplois,
      cibleMediateurs: cible._count.mediateursEnActivite,
    }

    if (dryRun) {
      results.push({ row, ...cibleInfo, statut: 'a_fusionner' })
      merged++
    } else {
      try {
        await mergeStructure(row.id, row.cibleFusion, {
          timeout: 30_000,
          propagateVisibility: action === 'fusionner_review',
        })
        results.push({ row, ...cibleInfo, statut: 'fusionnee' })
        merged++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        output.log(
          `apply-fusionner-structures: ERREUR fusion ${row.id} → ${row.cibleFusion}: ${message}`,
        )
        results.push({ row, ...cibleInfo, statut: `erreur: ${message}` })
        skipped++
      }
    }
  }

  // ── Export CSV (groupé par cluster, une ligne par structure) ──

  const makeLine = (
    clusterId: string,
    role: string,
    statut: string,
    id: string,
    nom: string,
    adresse: string,
    commune: string,
    siret: string,
    activites: number | string,
    emplois: number | string,
    mediateurs: number | string,
    raison: string,
  ) =>
    [
      clusterId,
      role,
      statut,
      id,
      escapeCsvField(nom),
      escapeCsvField(adresse),
      escapeCsvField(commune),
      siret,
      activites,
      emplois,
      mediateurs,
      escapeCsvField(raison),
    ].join(';')

  // Regrouper par cluster
  const parCluster = new Map<string, ResultRow[]>()
  for (const r of results) {
    const clusterId = r.row.clusterId || 'sans_cluster'
    const group = parCluster.get(clusterId)
    if (group) group.push(r)
    else parCluster.set(clusterId, [r])
  }

  // Extraire le score depuis la raison pour trier
  const extractScore = (raison: string): number => {
    const match = raison.match(/score=(\d+\.\d+)/)
    return match ? Number.parseFloat(match[1]) : 0
  }

  // Trier les clusters par score minimum (les plus douteux en premier)
  const sortedClusters = [...parCluster.entries()].sort((a, b) => {
    const minA = Math.min(...a[1].map((r) => extractScore(r.row.raison)))
    const minB = Math.min(...b[1].map((r) => extractScore(r.row.raison)))
    return minA - minB
  })

  const csvLines: string[] = [reviewCsvHeader]

  for (const [clusterId, clusterResults] of sortedClusters) {
    // Ajouter la cible en premier (une seule fois par cluster)
    const first = clusterResults[0]
    if (first.cibleNom) {
      csvLines.push(
        makeLine(
          clusterId,
          'CIBLE',
          '',
          first.cibleId,
          first.cibleNom,
          first.cibleAdresse,
          first.cibleCommune,
          first.cibleSiret,
          first.cibleActivites,
          first.cibleEmplois,
          first.cibleMediateurs,
          '',
        ),
      )
    }

    // Ajouter les sources
    for (const r of clusterResults) {
      csvLines.push(
        makeLine(
          clusterId,
          'source',
          r.statut,
          r.row.id,
          r.row.nom,
          r.row.adresse,
          r.row.commune,
          r.row.siret,
          r.row.activitesCount,
          r.row.emploisCount,
          r.row.mediateursCount,
          r.row.raison,
        ),
      )
    }

    // Ligne vide pour séparer les clusters
    csvLines.push('')
  }

  const actionSuffix = action.replace('fusionner_', '')
  const suffix = dryRun ? 'dry-run' : 'applied'
  const filePath = getAuditOutputPath(
    `apply-fusionner-${actionSuffix}-${suffix}.csv`,
  )
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Rapport ──

  output.log(
    `\n=== FUSION ${action} ${dryRun ? '(DRY RUN)' : ''} - RÉSULTATS ===`,
  )
  output.log(`Total: ${toMerge.length}`)
  output.log(`${dryRun ? 'À fusionner' : 'Fusionnées'}: ${merged}`)
  output.log(`Ignorées: ${skipped}`)
  output.log(`Export: ${filePath}`)

  output.log(`\napply-fusionner-structures: terminé`)

  return {
    dryRun,
    action,
    total: toMerge.length,
    merged,
    skipped,
    export: filePath,
  }
}
