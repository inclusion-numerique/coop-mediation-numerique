import { output } from '@app/cli/output'
import { closeMongoClient } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { importCrasConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/importCrasConseillerNumeriqueV1'
import { Command } from '@commander-js/extra-typings'

const DEFAULT_SINCE = '2021-07-01'
const DEFAULT_UNTIL = '2025-01-01'

/**
 * Generate month-by-month date ranges between two dates
 */
const generateMonthlyRanges = ({
  since,
  until,
}: {
  since: Date
  until: Date
}): { since: Date; until: Date }[] => {
  const ranges: { since: Date; until: Date }[] = []
  let currentDate = new Date(since)

  while (currentDate < until) {
    const rangeStart = new Date(currentDate)
    // Move to first day of next month
    const rangeEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    )

    // Don't go past the final until date
    const actualEnd = rangeEnd > until ? until : rangeEnd

    ranges.push({
      since: rangeStart,
      until: actualEnd,
    })

    currentDate = rangeEnd
  }

  return ranges
}

const exit = async ({ message, code }: { message: string; code: number }) => {
  output(message)
  await closeMongoClient()
  process.exit(code)
}

export const importCras = new Command()
  .command('v1:import-cras')
  .description(
    'Import CRAs from MongoDB to PostgreSQL database (month-by-month batches)',
  )
  .option(
    '--since <date>',
    'Filter CRAs created since date (YYYY-MM-DD format)',
    DEFAULT_SINCE,
  )
  .option(
    '--until <date>',
    'Filter CRAs created until date (YYYY-MM-DD format)',
    DEFAULT_UNTIL,
  )
  .option(
    '--dry-run',
    'Preview import without actually writing to database',
    false,
  )
  .action(async (options) => {
    const overallStartTime = Date.now()

    const since = new Date(options.since)
    const until = new Date(options.until)

    // Validate dates
    if (Number.isNaN(since.getTime())) {
      output(`❌ Invalid --since date: ${options.since}`)
      await exit({
        message: `❌ Invalid --since date: ${options.since}`,
        code: 1,
      })
    }
    if (Number.isNaN(until.getTime())) {
      output(`❌ Invalid --until date: ${options.until}`)
      await exit({
        message: `❌ Invalid --until date: ${options.until}`,
        code: 1,
      })
    }
    if (since >= until) {
      output('❌ --since date must be before --until date')
      await exit({
        message: '❌ --since date must be before --until date',
        code: 1,
      })
    }

    const monthlyRanges = generateMonthlyRanges({ since, until })

    output('🔄 Starting CRA import from MongoDB (month-by-month batches)...')
    output('')
    output(`   Period: ${since.toISOString()} to ${until.toISOString()}`)
    output(`   Total batches: ${monthlyRanges.length}`)
    if (options.dryRun) {
      output('   ⚠️  DRY RUN MODE - No data will be written to database')
    }
    output('')
    output('━'.repeat(60))
    output('')

    let totalCrasFetched = 0
    let totalCrasCreated = 0
    let batchesWithData = 0
    let emptyBatches = 0

    try {
      // Process each monthly range
      for (let i = 0; i < monthlyRanges.length; i++) {
        const range = monthlyRanges[i]
        const batchStartTime = Date.now()

        output(
          `📦 Batch ${i + 1}/${monthlyRanges.length}: ${range.since.toISOString().split('T')[0]} → ${range.until.toISOString().split('T')[0]}`,
        )

        if (options.dryRun) {
          // For dry run, just fetch and count
          const { getConseillerNumeriqueCrasFromMongo } = await import(
            '@app/web/external-apis/conseiller-numerique/conseillersNumeriquesCraQueries'
          )

          const result = await getConseillerNumeriqueCrasFromMongo({
            createdAtSince: range.since,
            createdAtUntil: range.until,
          })

          if (result.empty) {
            output(`   ℹ️  No CRAs found`)
            emptyBatches++
          } else {
            output(`   ✅ Found ${result.cras.length} CRAs`)
            totalCrasFetched += result.cras.length
            batchesWithData++
          }
        } else {
          // Actual import
          const result = await importCrasConseillerNumeriqueV1({
            createdAtSince: range.since,
            createdAtUntil: range.until,
          })

          if (result.empty) {
            output(`   ℹ️  No CRAs found`)
            emptyBatches++
          } else {
            const skipped = result.cras.length - result.created
            output(
              `   ✅ Imported ${result.created} new CRAs (${skipped} duplicates skipped)`,
            )
            totalCrasFetched += result.cras.length
            totalCrasCreated += result.created
            batchesWithData++
          }
        }

        const batchDuration = Date.now() - batchStartTime
        output(`   ⏱️  Duration: ${batchDuration}ms`)
        output('')
      }

      // Final summary
      const totalDuration = Date.now() - overallStartTime
      output('━'.repeat(60))
      output('')
      output(
        `✅ All batches completed in ${(totalDuration / 1000).toFixed(1)}s`,
      )
      output('')
      output('📊 Summary:')
      output(`   - Total batches processed: ${monthlyRanges.length}`)
      output(`   - Batches with data: ${batchesWithData}`)
      output(`   - Empty batches: ${emptyBatches}`)
      output(`   - Total CRAs fetched: ${totalCrasFetched}`)

      if (!options.dryRun) {
        output(`   - New CRAs created: ${totalCrasCreated}`)
        output(
          `   - Duplicates skipped: ${totalCrasFetched - totalCrasCreated}`,
        )
        output('')

        if (totalCrasCreated > 0) {
          output('✨ Successfully imported CRAs to the database')
        } else if (totalCrasFetched > 0) {
          output(
            'ℹ️  All CRAs already existed in the database (skipDuplicates enabled)',
          )
        } else {
          output('ℹ️  No CRAs found in the specified date range')
        }
      } else {
        output('')
        output(
          '💡 Run without --dry-run to actually import these CRAs to the database',
        )
      }
    } catch (error) {
      const duration = Date.now() - overallStartTime
      output('')
      output('━'.repeat(60))
      output('')
      output(`❌ Import failed after ${(duration / 1000).toFixed(1)}s`)
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
      await exit({ message: '❌ Import failed', code: 1 })
    } finally {
      await exit({ message: '👍 Import completed successfully', code: 0 })
    }
  })
