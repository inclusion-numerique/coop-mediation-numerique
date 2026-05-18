import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import type { ApplyReviewToActionPlanJob } from './applyReviewToActionPlanJob'

type ReviewRow = {
  clusterId: string
  id: string
  role: string // 'CIBLE' | 'source'
  statut: string // 'a_fusionner' | ''
}

const parseReviewCsv = (content: string): ReviewRow[] => {
  const lines = content.split('\n')
  const rows: ReviewRow[] = []

  for (const line of lines.slice(1)) {
    const clean = line.replace(/\r$/, '')
    if (!clean.trim()) continue

    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of clean) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ';' && !inQuotes) {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current)

    const [clusterId, id, role, statut] = fields
    if (!clusterId || !id) continue

    rows.push({ clusterId, id, role, statut })
  }

  return rows
}

export const executeApplyReviewToActionPlan = async (
  job: ApplyReviewToActionPlanJob,
) => {
  const reviewFilename =
    job.payload?.reviewFile ?? 'tim_apply_fusionner_batch1.1.csv'
  const reviewPath = getAuditOutputPath(reviewFilename)

  if (!existsSync(reviewPath)) {
    throw new Error(`Fichier de review introuvable: ${reviewPath}`)
  }

  const actionPlanPath = getAuditOutputPath('structures-action-plan.csv')
  if (!existsSync(actionPlanPath)) {
    throw new Error(
      `Plan d'action introuvable: ${actionPlanPath}. Lancez d'abord generate-structures-action-plan.`,
    )
  }

  output.log('apply-review-to-action-plan: starting...')

  // ── Parse review CSV ──
  const reviewContent = await readFile(reviewPath, 'utf-8')
  const reviewRows = parseReviewCsv(reviewContent)

  // Build direct mapping: sourceId → cibleId (independent of cluster IDs)
  const clusterToCible = new Map<string, string>()
  const sourceToCluster = new Map<string, string>()

  for (const row of reviewRows) {
    if (row.role === 'CIBLE') {
      clusterToCible.set(row.clusterId, row.id)
    }
    if (row.role === 'source' && row.statut === 'a_fusionner') {
      sourceToCluster.set(row.id, row.clusterId)
    }
  }

  const sourceToCible = new Map<string, string>()
  for (const [sourceId, clusterId] of sourceToCluster) {
    const cibleId = clusterToCible.get(clusterId)
    if (cibleId) {
      sourceToCible.set(sourceId, cibleId)
    }
  }

  output.log(
    `apply-review-to-action-plan: ${clusterToCible.size} clusters, ${sourceToCible.size} sources à fusionner`,
  )

  // ── Read and patch action plan ──
  const actionPlanContent = await readFile(actionPlanPath, 'utf-8')
  const actionPlanLines = actionPlanContent.split('\n')
  const header = actionPlanLines[0]

  let updated = 0
  const patchedLines = [header]

  for (const line of actionPlanLines.slice(1)) {
    const clean = line.replace(/\r$/, '')
    if (!clean.trim()) continue

    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of clean) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ';' && !inQuotes) {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current)

    // id;action;cible_fusion;cluster_id;...
    const id = fields[0]

    const newCible = sourceToCible.get(id)
    if (newCible) {
      fields[1] = 'fusionner_review'
      fields[2] = newCible
      updated++
    }

    patchedLines.push(fields.join(';'))
  }

  await writeFile(actionPlanPath, patchedLines.join('\n'), 'utf-8')

  output.log(`\n=== APPLY REVIEW TO ACTION PLAN - RÉSULTATS ===`)
  output.log(`Fichier review: ${reviewFilename}`)
  output.log(`Clusters traités: ${clusterToCible.size}`)
  output.log(`Sources marquées fusionner_review: ${updated}`)
  output.log(`Plan d'action mis à jour: ${actionPlanPath}`)

  output.log('\napply-review-to-action-plan: terminé')

  return {
    reviewFile: reviewFilename,
    clusters: clusterToCible.size,
    sourcesInReview: sourceToCible.size,
    updated,
  }
}
