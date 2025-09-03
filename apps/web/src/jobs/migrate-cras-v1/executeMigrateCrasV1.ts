import type { MigrateCrasV1Job } from '@app/web/jobs/migrate-cras-v1/MigrateCrasV1Job'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { numberToString } from '@app/web/utils/formatNumber'
import * as Sentry from '@sentry/nextjs'
import { v1PermanencesIdsMap } from '../migrate-structures-v1/v1PermanencesIdsMap'
import { v1StructuresIdsMap } from '../migrate-structures-v1/v1StructuresIdsMap'
import { v1ConseillersIdsMap } from '../migrate-users-v1/v1ConseillersIdsMap'
import { migrateCrasV1 } from './migrateCrasV1'

const cleanupAfterImport = async () => {
  await prismaClient.$queryRaw`
  VACUUM ANALYZE "activites"
`
}

const migrateCrasV1ByBatch = async ({
  skip,
  take,
  batch,
}: MigrateCrasV1Job['payload']) => {
  const result = {
    totalImported: 0,
    skip,
    take,
    batch,
  }

  let rest = take ? take : undefined
  let items = await prismaClient.craConseillerNumeriqueV1.findMany({
    skip,
    take: batch,
  })

  while (items.length > 0 && (rest === undefined || rest > 0)) {
    output.log(
      `import-cras-conseiller-numerique-v1: importing ${numberToString(skip)} to ${numberToString(skip + items.length)} cras`,
    )
    await migrateCrasV1(items, {
      v1ConseillersIdsMap,
      v1PermanencesIdsMap,
      v1StructuresIdsMap,
    })
    skip += items.length
    if (rest !== undefined) {
      rest -= items.length
    }
    items = await prismaClient.craConseillerNumeriqueV1.findMany({
      skip,
      take: rest !== undefined ? Math.min(rest, batch) : batch,
    })
    result.totalImported += items.length
  }

  output.log(
    `migrate-cras-v1: imported ${numberToString(result.totalImported)} cras`,
  )

  await cleanupAfterImport()
  output.log(
    `migrate-cras-v1: finished importing ${numberToString(result.totalImported)} cras`,
  )

  return result
}

/**
 * Wrapper to launch the execution asynchronously
 */
export const executeMigrateCrasV1 = (job: MigrateCrasV1Job) => {
  output.log(`migrate-cras-v1: importing`)

  // Async execution
  migrateCrasV1ByBatch(job.payload).catch((error) => {
    if (Sentry.captureException) {
      Sentry.captureException(error)
    }
    // biome-ignore lint/suspicious/noConsole: we need output from job executions
    console.error(error)
  })

  return Promise.resolve({})
}
