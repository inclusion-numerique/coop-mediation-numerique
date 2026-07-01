import { writeFile } from 'node:fs/promises'
import {
  type ActionPlanRow,
  escapeCsvField,
  filterActionPlan,
  readActionPlan,
} from '@app/web/jobs/audit-csv'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { ApplySupprimerStructuresJob } from './applySupprimerStructuresJob'

const dryRunCsvHeader = [
  'id',
  'nom',
  'adresse',
  'commune',
  'code_postal',
  'siret',
  'visible_carto',
  'activites_count',
  'emplois_count',
  'mediateurs_count',
  'raison',
  'statut',
].join(';')

const rowToDryRunCsv = (row: ActionPlanRow, statut: string): string =>
  [
    row.id,
    escapeCsvField(row.nom),
    escapeCsvField(row.adresse),
    escapeCsvField(row.commune),
    row.codePostal,
    row.siret,
    row.visibleCarto,
    row.activitesCount,
    row.emploisCount,
    row.mediateursCount,
    escapeCsvField(row.raison),
    statut,
  ].join(';')

export const executeApplySupprimerStructures = async (
  job: ApplySupprimerStructuresJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `apply-supprimer-structures: starting${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const actionPlan = await readActionPlan()
  const toDelete = filterActionPlan(actionPlan, 'supprimer')

  output.log(
    `apply-supprimer-structures: ${toDelete.length} structures à supprimer`,
  )

  if (toDelete.length === 0) {
    return { dryRun, total: 0, deleted: 0, skipped: 0 }
  }

  const results: { row: ActionPlanRow; statut: string }[] = []
  let deleted = 0
  let skipped = 0

  for (const [index, row] of toDelete.entries()) {
    if ((index + 1) % 100 === 0) {
      output.log(
        `apply-supprimer-structures: progress ${index + 1}/${toDelete.length}`,
      )
    }

    // Vérification de sécurité : re-vérifier que la structure est toujours orpheline
    const structure = await prismaClient.lieuInclusion.findUnique({
      where: { id: row.id },
      select: {
        id: true,
        nom: true,
        adresse: true,
        codeInsee: true,
        activitesCount: true,
        _count: {
          select: {
            mediateursEnActivite: true,
            activites: true,
          },
        },
      },
    })

    if (!structure) {
      results.push({ row, statut: 'introuvable' })
      skipped++
      continue
    }

    // Emplois + activités employeuse corrélés par nom + adresse + code INSEE (plus de lien FK).
    // Décision de SUPPRESSION : on corrèle directement, en comptant à l'identique de
    // l'ancien _count via le lien (sans filtre de suppression sur emplois/activités).
    const correlatedEmployeuses =
      await prismaClient.structureAdministrative.findMany({
        where: {
          nom: structure.nom,
          adresse: structure.adresse,
          codeInsee: structure.codeInsee,
          suppression: null,
        },
        select: { _count: { select: { emplois: true, activites: true } } },
      })
    const emploisCount = correlatedEmployeuses.reduce(
      (sum, employeuse) => sum + employeuse._count.emplois,
      0,
    )
    const activitesEmployeurCount = correlatedEmployeuses.reduce(
      (sum, employeuse) => sum + employeuse._count.activites,
      0,
    )

    const hasData =
      structure.activitesCount > 0 ||
      emploisCount > 0 ||
      structure._count.mediateursEnActivite > 0 ||
      structure._count.activites > 0 ||
      activitesEmployeurCount > 0

    if (hasData) {
      output.log(
        `apply-supprimer-structures: SKIP ${row.id} "${row.nom}" — données associées détectées (activites=${structure.activitesCount} emplois=${emploisCount} mediateurs=${structure._count.mediateursEnActivite} relations_activites=${structure._count.activites} activites_employeur=${activitesEmployeurCount})`,
      )
      results.push({ row, statut: 'skip_donnees_associees' })
      skipped++
      continue
    }

    if (dryRun) {
      results.push({ row, statut: 'a_supprimer' })
      deleted++
    } else {
      try {
        await prismaClient.lieuInclusion.delete({
          where: { id: row.id },
        })
        results.push({ row, statut: 'supprimee' })
        deleted++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        output.log(
          `apply-supprimer-structures: ERREUR suppression ${row.id} "${row.nom}": ${message}`,
        )
        results.push({ row, statut: `erreur: ${message}` })
        skipped++
      }
    }
  }

  // ── Export CSV ──

  const csvLines = [
    dryRunCsvHeader,
    ...results.map((r) => rowToDryRunCsv(r.row, r.statut)),
  ]
  const suffix = dryRun ? 'dry-run' : 'applied'
  const filePath = getAuditOutputPath(`apply-supprimer-${suffix}.csv`)
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Rapport ──

  output.log(`\n=== SUPPRESSION ${dryRun ? '(DRY RUN)' : ''} - RÉSULTATS ===`)
  output.log(`Total: ${toDelete.length}`)
  output.log(`${dryRun ? 'À supprimer' : 'Supprimées'}: ${deleted}`)
  output.log(`Ignorées: ${skipped}`)
  output.log(`Export: ${filePath}`)

  output.log(`\napply-supprimer-structures: terminé`)

  return { dryRun, total: toDelete.length, deleted, skipped, export: filePath }
}
