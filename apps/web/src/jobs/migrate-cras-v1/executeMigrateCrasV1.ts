import type { MigrateCrasV1Job } from '@app/web/jobs/migrate-cras-v1/MigrateCrasV1Job'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { createStopwatch } from '@app/web/utils/stopwatch'
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
  const totalCount = await prismaClient.craConseillerNumeriqueV1.count()
  const stopwatch = createStopwatch()
  const result = {
    totalCount: take ? Math.min(totalCount, take) : totalCount,
    totalImported: 0,
    skip,
    take,
    batch,
  }

  const started = stopwatch.started

  let processedCount = 0
  let rest = take ? take : undefined
  let items = await prismaClient.craConseillerNumeriqueV1.findMany({
    skip,
    take: batch,
  })

  while (items.length > 0 && (rest === undefined || rest > 0)) {
    output.log(
      `migrate-cras-v1: importing cras batch ${numberToString(skip)} to ${numberToString(skip + items.length)}`,
    )
    await migrateCrasV1(items, {
      v1ConseillersIdsMap,
      v1PermanencesIdsMap,
      v1StructuresIdsMap,
    })
    skip += items.length
    processedCount += items.length
    if (rest !== undefined) {
      rest -= items.length
    }
    const checktime = stopwatch.check()

    // Elapsed time since start, in ms
    const elapsedMs = checktime.checked.getTime() - started.getTime()
    const percentageDone =
      result.totalCount === 0 ? 0 : (processedCount / result.totalCount) * 100
    // Estimate remaining time based on elapsed and progress
    const timeRemainingEstimationMs =
      percentageDone > 0
        ? (elapsedMs * (100 - percentageDone)) / percentageDone
        : 0

    const timeRemainingEstimationMinutes = timeRemainingEstimationMs / 60_000

    output.log(
      `migrate-cras-v1: ${numberToString(processedCount)}/${numberToString(result.totalCount)} cras imported in ${dureeAsString(elapsedMs / 60_000)} (${numberToPercentage(percentageDone)} - ~${dureeAsString(timeRemainingEstimationMinutes)} remaining)`,
    )

    items = await prismaClient.craConseillerNumeriqueV1.findMany({
      skip,
      take: rest !== undefined ? Math.min(rest, batch) : batch,
    })
    result.totalImported = processedCount
  }

  const ended = stopwatch.stop().ended

  output.log(
    `migrate-cras-v1: imported ${numberToString(result.totalImported)} cras`,
  )

  await cleanupAfterImport()
  output.log(
    `migrate-cras-v1: finished importing ${numberToString(result.totalImported)} cras in ${numberToString((ended.getTime() - started.getTime()) / 1000)}`,
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
