import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const AUDIT_OUTPUT_DIR = 'output/audit-structures'

export const getAuditOutputPath = (filename: string): string => {
  const dir = join(process.cwd(), AUDIT_OUTPUT_DIR)
  mkdirSync(dir, { recursive: true })
  return join(dir, filename)
}
