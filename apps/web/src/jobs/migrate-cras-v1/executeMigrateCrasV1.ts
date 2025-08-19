import { vacuumAnalyzeConseillerNumeriqueV1Cras } from '@app/web/external-apis/conseiller-numerique/conseillersNumeriquesCraQueries'
import {
  firstV1CrasMonth,
  importCrasConseillerNumeriqueV1,
} from '@app/web/external-apis/conseiller-numerique/importCrasConseillerNumeriqueV1'
import type { MigrateCrasV1Job } from '@app/web/jobs/migrate-cras-v1/MigrateCrasV1Job'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { numberToString } from '@app/web/utils/formatNumber'
import * as Sentry from '@sentry/nextjs'
import { addWeeks } from 'date-fns'

const cleanupAfterImport = async () => {
  await prismaClient.$queryRaw`
  VACUUM ANALYZE "activites"
`
}

const migrateCrasV1BBatch = async () => {
  // Reset table
  await prismaClient.activite.deleteMany({
    where: {
      v1CraId: {
        not: null,
      },
    },
  })

  const result = {
    totalImported: 0,
  }

  // TODO with prisma do pagination 10_000 items batch, while batch is not empty
  let skip = 0
  let batch = await prismaClient.craConseillerNumeriqueV1.findMany({
    skip,
    take: 10_000,
  })

  while (batch.length > 0) {
    output.log(
      `import-cras-conseiller-numerique-v1: importing ${numberToString(skip)} to ${numberToString(skip + batch.length)} cras`,
    )
    await migrateCrasConseillerNumeriqueV1({
      crasV1: batch,
    })
    skip += batch.length
    batch = await prismaClient.craConseillerNumeriqueV1.findMany({
      skip,
      take: 10_000,
    })
    result.totalImported += batch.length
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
export const executeMigrateCrasV1 = (_job: MigrateCrasV1Job) => {
  output.log(`migrate-cras-v1: importing`)

  // Async execution
  migrateCrasV1BBatch().catch((error) => {
    if (Sentry.captureException) {
      Sentry.captureException(error)
    }
    // biome-ignore lint/suspicious/noConsole: we need output from job executions
    console.error(error)
  })

  return Promise.resolve({})
}
