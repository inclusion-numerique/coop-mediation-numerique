import { writeFile } from 'node:fs/promises'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import {
  type ActionPlanRow,
  escapeCsvField,
  filterActionPlan,
  readActionPlan,
} from '@app/web/jobs/audit-csv'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { ApplyCorrigerCoordonneesJob } from './applyCorrigerCoordonneesJob'

const BATCH_SIZE = 50
const PAUSE_MS = 1000
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const dryRunCsvHeader = [
  'id',
  'nom',
  'adresse',
  'commune',
  'code_postal',
  'latitude_actuelle',
  'longitude_actuelle',
  'latitude_corrigee',
  'longitude_corrigee',
  'ban_score',
  'ban_id',
  'raison',
  'statut',
].join(';')

type Result = {
  row: ActionPlanRow
  latActuelle: string
  lonActuelle: string
  latCorrigee: string
  lonCorrigee: string
  banScore: string
  banId: string
  statut: string
}

const resultToCsv = (r: Result): string =>
  [
    r.row.id,
    escapeCsvField(r.row.nom),
    escapeCsvField(r.row.adresse),
    escapeCsvField(r.row.commune),
    r.row.codePostal,
    r.latActuelle,
    r.lonActuelle,
    r.latCorrigee,
    r.lonCorrigee,
    r.banScore,
    r.banId,
    escapeCsvField(r.row.raison),
    r.statut,
  ].join(';')

export const executeApplyCorrigerCoordonnees = async (
  job: ApplyCorrigerCoordonneesJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `apply-corriger-coordonnees: starting${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const actionPlan = await readActionPlan()
  const toFix = filterActionPlan(actionPlan, 'corriger_coordonnees')

  output.log(
    `apply-corriger-coordonnees: ${toFix.length} coordonnées à corriger`,
  )

  if (toFix.length === 0) {
    return { dryRun, total: 0, corrected: 0, skipped: 0 }
  }

  const results: Result[] = []
  let corrected = 0
  let skipped = 0

  for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
    const batch = toFix.slice(i, i + BATCH_SIZE)

    output.log(
      `apply-corriger-coordonnees: progress ${i + batch.length}/${toFix.length}`,
    )

    for (const row of batch) {
      const structure = await prismaClient.structure.findUnique({
        where: { id: row.id },
        select: {
          id: true,
          adresse: true,
          commune: true,
          codePostal: true,
          latitude: true,
          longitude: true,
        },
      })

      if (!structure) {
        results.push({
          row,
          latActuelle: '',
          lonActuelle: '',
          latCorrigee: '',
          lonCorrigee: '',
          banScore: '',
          banId: '',
          statut: 'introuvable',
        })
        skipped++
        continue
      }

      const query = `${structure.adresse}, ${structure.codePostal} ${structure.commune}`
      const feature = await searchAdresse(query)

      if (!feature || feature.properties.score < 0.5) {
        results.push({
          row,
          latActuelle: structure.latitude?.toFixed(6) ?? '',
          lonActuelle: structure.longitude?.toFixed(6) ?? '',
          latCorrigee: '',
          lonCorrigee: '',
          banScore: feature?.properties.score.toFixed(3) ?? '0',
          banId: '',
          statut: 'non_corrigeable',
        })
        skipped++
        continue
      }

      const banData = banFeatureToAdresseBanData(feature)

      const result: Result = {
        row,
        latActuelle: structure.latitude?.toFixed(6) ?? '',
        lonActuelle: structure.longitude?.toFixed(6) ?? '',
        latCorrigee: banData.latitude.toFixed(6),
        lonCorrigee: banData.longitude.toFixed(6),
        banScore: feature.properties.score.toFixed(3),
        banId: banData.id,
        statut: dryRun ? 'a_corriger' : 'corrigee',
      }

      if (!dryRun) {
        await prismaClient.structure.update({
          where: { id: row.id },
          data: {
            latitude: banData.latitude,
            longitude: banData.longitude,
            banId: banData.id,
            modification: new Date(),
          },
        })
      }

      results.push(result)
      corrected++
    }

    if (i + BATCH_SIZE < toFix.length) await delay(PAUSE_MS)
  }

  // ── Export CSV ──

  const csvLines = [dryRunCsvHeader, ...results.map(resultToCsv)]
  const suffix = dryRun ? 'dry-run' : 'applied'
  const filePath = getAuditOutputPath(
    `apply-corriger-coordonnees-${suffix}.csv`,
  )
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Rapport ──

  output.log(
    `\n=== CORRIGER COORDONNÉES ${dryRun ? '(DRY RUN)' : ''} - RÉSULTATS ===`,
  )
  output.log(`Total: ${toFix.length}`)
  output.log(`${dryRun ? 'À corriger' : 'Corrigées'}: ${corrected}`)
  output.log(`Non corrigeables: ${skipped}`)
  output.log(`Export: ${filePath}`)

  output.log(`\napply-corriger-coordonnees: terminé`)

  return {
    dryRun,
    total: toFix.length,
    corrected,
    skipped,
    export: filePath,
  }
}
