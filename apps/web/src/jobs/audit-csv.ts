import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'

const parseCsv = (content: string, separator = ';'): string[][] => {
  const lines = content.split('\n').filter((l) => l.trim())
  return lines.map((line) => {
    const cleanLine = line.replace(/\r$/, '')
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of cleanLine) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === separator && !inQuotes) {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current)
    return fields
  })
}

export type ActionPlanRow = {
  id: string
  action: string
  cibleFusion: string
  clusterId: string
  priorite: string
  raison: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  siret: string
  visibleCarto: string
  activitesCount: string
  emploisCount: string
  mediateursCount: string
}

export const readActionPlan = async (): Promise<ActionPlanRow[]> => {
  const filePath = getAuditOutputPath('structures-action-plan.csv')
  if (!existsSync(filePath)) {
    throw new Error(
      `Plan d'action introuvable: ${filePath}. Lancez d'abord generate-structures-action-plan.`,
    )
  }
  const content = await readFile(filePath, 'utf-8')
  const [, ...rows] = parseCsv(content)

  return rows.map((r) => ({
    id: r[0],
    action: r[1],
    cibleFusion: r[2],
    clusterId: r[3],
    priorite: r[4],
    raison: r[5],
    nom: r[6],
    adresse: r[7],
    commune: r[8],
    codePostal: r[9],
    siret: r[10],
    visibleCarto: r[11],
    activitesCount: r[12],
    emploisCount: r[13],
    mediateursCount: r[14],
  }))
}

export const filterActionPlan = (
  rows: ActionPlanRow[],
  action: string,
): ActionPlanRow[] => rows.filter((r) => r.action === action)

export const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value
