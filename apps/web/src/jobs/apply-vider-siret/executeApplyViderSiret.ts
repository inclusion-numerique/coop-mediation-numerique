import { writeFile } from 'node:fs/promises'
import {
  clearSiret,
  type SiretSource,
} from '@app/web/features/structures/siret/siretBearingStructures'
import {
  type ActionPlanRow,
  escapeCsvField,
  filterActionPlan,
  readActionPlan,
} from '@app/web/jobs/audit-csv'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { ApplyViderSiretJob } from './applyViderSiretJob'

const dryRunCsvHeader = [
  'id',
  'source',
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
    row.source,
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

const toSiretSource = (source: string): SiretSource =>
  source === 'employeuse' ? 'employeuse' : 'lieu'

const findSiret = async (
  id: string,
  source: SiretSource,
): Promise<{ id: string; siret: string | null } | null> =>
  source === 'lieu'
    ? prismaClient.lieuInclusion.findUnique({
        where: { id },
        select: { id: true, siret: true },
      })
    : prismaClient.structureAdministrative.findUnique({
        where: { id },
        select: { id: true, siret: true },
      })

export const executeApplyViderSiret = async (job: ApplyViderSiretJob) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(`apply-vider-siret: starting${dryRun ? ' (DRY RUN)' : ''}...`)

  const actionPlan = await readActionPlan()
  const toClear = filterActionPlan(actionPlan, 'vider_siret')

  output.log(`apply-vider-siret: ${toClear.length} SIRET à vider`)

  if (toClear.length === 0) {
    return { dryRun, total: 0, cleared: 0, skipped: 0 }
  }

  const results: { row: ActionPlanRow; statut: string }[] = []
  const counters = { cleared: 0, skipped: 0 }

  for (const row of toClear) {
    const source = toSiretSource(row.source)
    const structure = await findSiret(row.id, source)

    if (!structure) {
      results.push({ row, statut: 'introuvable' })
      counters.skipped++
      continue
    }

    if (!structure.siret) {
      results.push({ row, statut: 'skip_deja_vide' })
      counters.skipped++
      continue
    }

    if (dryRun) {
      results.push({ row, statut: 'a_vider' })
      counters.cleared++
      continue
    }

    await clearSiret({ id: row.id, source })
    results.push({ row, statut: 'vide' })
    counters.cleared++
  }

  const csvLines = [
    dryRunCsvHeader,
    ...results.map((r) => rowToCsv(r.row, r.statut)),
  ]
  const suffix = dryRun ? 'dry-run' : 'applied'
  const filePath = getAuditOutputPath(`apply-vider-siret-${suffix}.csv`)
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  output.log(`\n=== VIDER SIRET ${dryRun ? '(DRY RUN)' : ''} - RÉSULTATS ===`)
  output.log(`Total: ${toClear.length}`)
  output.log(`${dryRun ? 'À vider' : 'Vidés'}: ${counters.cleared}`)
  output.log(`Ignorés: ${counters.skipped}`)
  output.log(`Export: ${filePath}`)

  output.log('\napply-vider-siret: terminé')

  return {
    dryRun,
    total: toClear.length,
    cleared: counters.cleared,
    skipped: counters.skipped,
    export: filePath,
  }
}
