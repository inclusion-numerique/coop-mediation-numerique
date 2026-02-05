import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { output } from '@app/cli/output'
import {
  createStructuresRequiredForRepair,
  type ManualMatch,
  type MissingStructure,
  repairCraV1LieuxActivite,
} from '@app/web/features/v1/repairCraV1LieuxActivite'
import { Command } from '@commander-js/extra-typings'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const CSV_OUTPUT_PATH = 'var/v1-structures-missing.csv'
const CSV_COMPLETED_PATH = 'var/v1-structures-missing-completed.csv'

type CsvManualMatch = {
  v1PermanenceId: string
  v1StructureId: string
  v2StructureId: string
}

const readManualMatches = (): ManualMatch[] => {
  const fullPath = resolve(process.cwd(), CSV_COMPLETED_PATH)

  if (!existsSync(fullPath)) {
    return []
  }

  const content = readFileSync(fullPath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';',
  }) as CsvManualMatch[]

  // Filter only rows that have a v2StructureId
  return records
    .filter((r) => r.v2StructureId && r.v2StructureId.trim() !== '')
    .map((r) => ({
      v1PermanenceId: r.v1PermanenceId?.trim() || null,
      v1StructureId: r.v1StructureId?.trim() || null,
      v2StructureId: r.v2StructureId.trim(),
    }))
}

const writeMissingStructuresCsv = (structures: MissingStructure[]): string => {
  const records = structures.map((s) => ({
    v1PermanenceId: s.v1PermanenceId ?? '',
    v1StructureId: s.v1StructureId ?? '',
    siret: s.siret ?? '',
    nom: s.nom ?? '',
    adresse: s.adresse ?? '',
    codePostal: s.codePostal ?? '',
    commune: s.commune ?? '',
    codeInsee: s.codeInsee ?? '',
    craCount: s.craCount,
  }))

  const csv = stringify(records, { header: true })

  const fullPath = resolve(process.cwd(), CSV_OUTPUT_PATH)
  const dir = dirname(fullPath)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(fullPath, csv, 'utf-8')

  return fullPath
}

export const repairCraV1LieuxActiviteCommand = new Command()
  .command('v1:repair-cra-v1-lieux-activite')
  .description(
    'Repair CRA v1 with canal "rattachement" by assigning the correct type_lieu and structure_id',
  )
  .option(
    '--dry-run',
    'Preview changes without actually updating the database (default: true)',
    true,
  )
  .option('--execute', 'Actually execute the updates (disables dry-run)', false)
  .option(
    '--create-structures',
    'Create missing structures before running the repair',
    false,
  )
  .action(async (options) => {
    const startTime = Date.now()
    const dryRun = !options.execute
    const createStructures = options.createStructures

    output('🔄 Repair CRA V1 Lieux Activite')
    output('')
    output('━'.repeat(60))
    output('')

    // Load manual matches from completed CSV if it exists
    const manualMatches = readManualMatches()
    if (manualMatches.length > 0) {
      output(
        `📋 Loaded ${manualMatches.length} manual matches from ${CSV_COMPLETED_PATH}`,
      )
      output('')
    }

    if (dryRun) {
      output('⚠️  DRY RUN MODE - No data will be modified')
    } else {
      output('🚀 EXECUTE MODE - Data will be updated')
    }
    if (createStructures) {
      output('🏗️  CREATE STRUCTURES MODE - Missing structures will be created')
    }
    output('')

    try {
      // First pass: analyze the situation
      output('📊 Analyzing CRA v1 with canal "rattachement"...')
      output('')

      const result = await repairCraV1LieuxActivite({
        dryRun: true,
        manualMatches,
        onProgress: (msg) => output(`   ${msg}`),
      })

      // Display summary
      output('📊 Resolution Summary:')
      output('')
      for (const row of result.summary) {
        const permanenceInfo =
          row.distinctPermanences > 0
            ? ` (${row.distinctPermanences} distinct permanences)`
            : ''
        const structureInfo =
          row.distinctStructures > 0
            ? ` (${row.distinctStructures} distinct structures)`
            : ''
        output(
          `   ${row.resolutionType}: ${row.crasCount} CRAs${permanenceInfo}${structureInfo}`,
        )
      }
      output('')

      // Check for missing structures
      if (result.missingStructures.length > 0) {
        output('━'.repeat(60))
        output('')

        // Count totals
        const totalMissingStructures = result.missingStructures.length
        const totalMissingCras = result.missingStructures.reduce(
          (acc, s) => acc + s.craCount,
          0,
        )
        const permanenceCount = result.missingStructures.filter(
          (s) => s.v1PermanenceId !== null,
        ).length
        const structureCount = result.missingStructures.filter(
          (s) => s.v1StructureId !== null,
        ).length

        output(
          `❌ Found ${totalMissingStructures} structures that need to be created:`,
        )
        output('')
        output('📊 Missing Structures Summary:')
        output(`   - Total missing structures: ${totalMissingStructures}`)
        output(`   - From permanences: ${permanenceCount}`)
        output(`   - From structures (no permanence): ${structureCount}`)
        output(`   - Total CRAs affected: ${totalMissingCras}`)
        output('')

        // Write CSV file
        const csvPath = writeMissingStructuresCsv(result.missingStructures)
        output(`📄 CSV exported to: ${csvPath}`)
        output('')

        if (createStructures) {
          // Create missing structures
          output('━'.repeat(60))
          output('')
          output('🏗️  Creating missing structures...')
          output('')

          const createResult = await createStructuresRequiredForRepair(
            result.missingStructures,
            (current, total, structure) => {
              const name = structure.nom || '(no name)'
              const truncatedName =
                name.length > 40 ? `${name.substring(0, 37)}...` : name
              output(`   [${current}/${total}] Creating: ${truncatedName}`)
            },
          )

          output('')
          output('━'.repeat(60))
          output('')
          output('📊 Structure Creation Summary:')
          output(`   - Created: ${createResult.created}`)
          output(`   - Errors: ${createResult.errors.length}`)

          if (createResult.errors.length > 0) {
            output('')
            output('❌ Errors:')
            for (const { structure, error } of createResult.errors) {
              output(`   - ${structure.nom || '(no name)'}: ${error}`)
            }
          }

          // Now run the repair again to update the activites
          if (!dryRun && createResult.created > 0) {
            output('')
            output('━'.repeat(60))
            output('')
            output('🔄 Running repair after structure creation...')
            output('')

            const finalResult = await repairCraV1LieuxActivite({
              dryRun: false,
              manualMatches,
              onProgress: (msg) => output(`   ${msg}`),
            })

            if (finalResult.missingStructures.length > 0) {
              output(
                `⚠️  Still ${finalResult.missingStructures.length} missing structures`,
              )
            } else {
              output(`✅ Updated ${finalResult.updatedCount} activites`)
            }
          } else if (dryRun) {
            output('')
            output(
              '💡 Run with --execute --create-structures to create structures and update activites',
            )
          }
        } else {
          // Show the list of missing structures
          output('Missing structures details:')
          output('')

          for (const structure of result.missingStructures) {
            const idInfo = structure.v1PermanenceId
              ? `v1PermanenceId: ${structure.v1PermanenceId}`
              : `v1StructureId: ${structure.v1StructureId}`

            output(`   📍 ${structure.nom || '(no name)'}`)
            output(`      ${idInfo}`)
            output(`      SIRET: ${structure.siret || '(none)'}`)
            output(
              `      Adresse: ${structure.adresse || '(none)'}, ${structure.codePostal} ${structure.commune}`,
            )
            output(`      Code INSEE: ${structure.codeInsee || '(none)'}`)
            output(`      CRAs concernés: ${structure.craCount}`)
            output('')
          }

          output('━'.repeat(60))
          output('')
          output(
            '💡 Run with --create-structures to automatically create missing structures:',
          )
          output(
            '   pnpm -F cli cli v1:repair-cra-v1-lieux-activite --create-structures',
          )
          output('')
          output('   Or with --execute to also update the activites:')
          output(
            '   pnpm -F cli cli v1:repair-cra-v1-lieux-activite --execute --create-structures',
          )
        }
      } else if (dryRun) {
        output('━'.repeat(60))
        output('')
        output('✅ All structures exist - ready to update')
        output('')
        output('   Run with --execute to apply the changes:')
        output('   pnpm -F cli cli v1:repair-cra-v1-lieux-activite --execute')
      } else {
        // No missing structures and execute mode - run the actual update
        output('━'.repeat(60))
        output('')
        output('🔄 Updating activites...')

        const finalResult = await repairCraV1LieuxActivite({
          dryRun: false,
          manualMatches,
          onProgress: (msg) => output(`   ${msg}`),
        })
        output('')
        output(`✅ Updated ${finalResult.updatedCount} activites`)
      }

      const duration = Date.now() - startTime
      output('')
      output(`⏱️  Completed in ${(duration / 1000).toFixed(1)}s`)
    } catch (error) {
      const duration = Date.now() - startTime
      output('')
      output('━'.repeat(60))
      output('')
      output(`❌ Repair failed after ${(duration / 1000).toFixed(1)}s`)
      output('')
      output('Error details:')
      if (error instanceof Error) {
        output(`   ${error.message}`)
        if (error.stack) {
          output('')
          output('Stack trace:')
          output(error.stack)
        }
      } else {
        output(`   ${String(error)}`)
      }
      process.exit(1)
    }
  })
