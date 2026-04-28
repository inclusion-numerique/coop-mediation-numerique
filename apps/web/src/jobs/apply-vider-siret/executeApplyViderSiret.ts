import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import {
  type ActionPlanRow,
  escapeCsvField,
  filterActionPlan,
  readActionPlan,
} from '@app/web/jobs/audit-csv'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { writeFile } from 'node:fs/promises'
import type { ApplyViderSiretJob } from './applyViderSiretJob'

const dryRunCsvHeader = [
  'id',
  'nom',
  'adresse',
  'commune',
  'siret_actuel',
  'activites_count',
  'emplois_count',
  'mediateurs_count',
  'raison',
  'statut',
].join(';')

const rowToCsv = (row: ActionPlanRow, statut: string): string =>
  [
    row.id,
    escapeCsvField(row.nom),
    escapeCsvField(row.adresse),
    escapeCsvField(row.commune),
    row.siret,
    row.activitesCount,
    row.emploisCount,
    row.mediateursCount,
    escapeCsvField(row.raison),
    statut,
  ].join(';')

export const executeApplyViderSiret = async (job: ApplyViderSiretJob) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `apply-vider-siret: starting${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const actionPlan = await readActionPlan()
  const toClear = filterActionPlan(actionPlan, 'vider_siret')

  output.log(
    `apply-vider-siret: ${toClear.length} SIRET à vider`,
  )

  if (toClear.length === 0) {
    return { dryRun, total: 0, cleared: 0, skipped: 0 }
  }

  const results: { row: ActionPlanRow; statut: string }[] = []
  let cleared = 0
  let skipped = 0

  for (const row of toClear) {
    const structure = await prismaClient.structure.findUnique({
      where: { id: row.id },
      select: { id: true, siret: true },
    })

    if (!structure) {
      results.push({ row, statut: 'introuvable' })
      skipped++
      continue
    }

    if (!structure.siret) {
      results.push({ row, statut: 'skip_deja_vide' })
      skipped++
      continue
    }

    if (dryRun) {
      results.push({ row, statut: 'a_vider' })
      cleared++
    } else {
      await prismaClient.structure.update({
        where: { id: row.id },
        data: { siret: null, synchronisationSiret: null },
      })
      results.push({ row, statut: 'vide' })
      cleared++
    }
  }

  // ── Export CSV ──

  const csvLines = [
    dryRunCsvHeader,
    ...results.map((r) => rowToCsv(r.row, r.statut)),
  ]
  const suffix = dryRun ? 'dry-run' : 'applied'
  const filePath = getAuditOutputPath(`apply-vider-siret-${suffix}.csv`)
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Rapport ──

  output.log(
    `\n=== VIDER SIRET ${dryRun ? '(DRY RUN)' : ''} - RÉSULTATS ===`,
  )
  output.log(`Total: ${toClear.length}`)
  output.log(`${dryRun ? 'À vider' : 'Vidés'}: ${cleared}`)
  output.log(`Ignorés: ${skipped}`)
  output.log(`Export: ${filePath}`)

  output.log(`\napply-vider-siret: terminé`)

  return { dryRun, total: toClear.length, cleared, skipped, export: filePath }
}
