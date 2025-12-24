import { output } from '@app/cli/output'
import { getConseillerNumeriqueCrasFromMongo } from '@app/web/external-apis/conseiller-numerique/conseillersNumeriquesCraQueries'
import { Command } from '@commander-js/extra-typings'

export const testFetchCras = new Command()
  .command('v1:test-fetch-cras')
  .description('Test fetching CRAs from MongoDB with parallel queries')
  .option(
    '--conseiller-id <id>',
    'Filter by conseiller numerique ID (optional)',
  )
  .option('--since <date>', 'Filter CRAs created since date (YYYY-MM-DD)')
  .option('--until <date>', 'Filter CRAs created until date (YYYY-MM-DD)')
  .option('--limit <number>', 'Limit number of results to display', '10')
  .action(async (options) => {
    const startTime = Date.now()

    output('🔍 Fetching CRAs from MongoDB...')

    const result = await getConseillerNumeriqueCrasFromMongo({
      conseillerNumeriqueId: options.conseillerId,
      createdAtSince: options.since ? new Date(options.since) : undefined,
      createdAtUntil: options.until ? new Date(options.until) : undefined,
    })

    const duration = Date.now() - startTime

    if (result.empty) {
      output('❌ No CRAs found with the given filters')
      return
    }

    output(`✅ Fetched in ${duration}ms`)
    output(`📊 Results:`)
    output(`   - CRAs: ${result.cras.length}`)
    output(`   - Structures: ${result.structures.length}`)
    output('')

    const limit = Number.parseInt(options.limit, 10)
    output(`📝 First ${limit} CRAs:`)
    for (const cra of result.cras.slice(0, limit)) {
      output(`   - ID: ${cra.id}`)
      output(`     Conseiller: ${cra.conseillerId}`)
      output(`     Structure: ${cra.structure?.nom ?? 'N/A'}`)
      output(
        `     Permanence: ${cra.permanence ? 'Yes' : 'No'}${cra.permanence ? ` (${(cra.permanence as any).nomEnseigne ?? 'N/A'})` : ''}`,
      )
      output(`     Created: ${cra.createdAt.toISOString()}`)
      output('')
    }

    output(`💾 Total structures loaded: ${result.structures.length}`)
    output(`   Sample structures (1000-1020):`)
    for (const structure of result.structures.slice(1000, 1020)) {
      output(`   - ${structure.id}: ${structure.nom}`)
    }
  })
