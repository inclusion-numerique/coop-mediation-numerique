import { prismaClient } from '@app/web/prismaClient'
import { createStopwatch } from '@app/web/utils/stopwatch'
import * as Sentry from '@sentry/nextjs'
import { v4 } from 'uuid'
import { executeAppliquerDispositifConum } from './appliquer-dispositif-conum/executeAppliquerDispositifConum'
import { executeFixUsersRoles } from './fix-users-roles/executeFixUsersRoles'
import { executeInactiveUsersReminders } from './inactive-users-reminders/executeInactiveUsersReminders'
import type { Job, JobName, JobPayload } from './jobs'
import { executeNormalizeSirets } from './normalize-sirets/executeNormalizeSirets'
import { output } from './output'
import { executeRemoveOrphanBrevoContacts } from './remove-orphan-brevo-contacts/executeRemoveOrphanBrevoContacts'
import { executeSyncRdvspData } from './sync-rdvsp-data/executeSyncRdvspData'
import { updateStructuresFromEntrepot } from './update-structures-cartographie-nationale/updateStructuresFromEntrepot'

export type JobExecutor<Name extends JobName, Result = unknown> = (
  job: Job & { name: Name; payload: JobPayload<Name> },
) => Promise<Result>

const executeUpdateStructuresCartographieNationale = async () => {
  output.log(
    `update-structures-carto: lecture des lieux de la cartographie nationale depuis l’Entrepôt`,
  )

  const execute = updateStructuresFromEntrepot()

  return await execute()
}

// Create an object that for each JobName, MUST has a JobExecutor<Name>
export const jobExecutors: {
  [Name in JobName]: JobExecutor<Name>
} = {
  'appliquer-dispositif-conum': executeAppliquerDispositifConum,
  'fix-users-roles': executeFixUsersRoles,
  'inactive-users-reminders': executeInactiveUsersReminders,
  'normalize-sirets': executeNormalizeSirets,
  'remove-orphan-brevo-contacts': executeRemoveOrphanBrevoContacts,
  'sync-rdvsp-data': executeSyncRdvspData,
  'update-structures-cartographie-nationale':
    executeUpdateStructuresCartographieNationale,
}

export const executeJob = async (job: Job) => {
  const stopWatch = createStopwatch()

  const id = v4()

  await prismaClient.jobExecution.create({
    data: {
      id,
      name: job.name,
      data: job.payload,
      started: stopWatch.started,
    },
  })

  try {
    const executor = jobExecutors[job.name] as JobExecutor<(typeof job)['name']>
    const result = await executor(job)
    const { ended, duration } = stopWatch.stop()

    await prismaClient.jobExecution
      .update({
        where: { id },
        data: {
          result: result as Record<string, string>,
          completed: ended,
        },
      })
      .catch((error) => {
        if (Sentry?.captureException) {
          Sentry.captureException(error)
        }
        // biome-ignore lint/suspicious/noConsole: we need output from job executions
        console.error(error)
      })

    return {
      id,
      status: 'ok',
      result,
      duration,
    }
  } catch (error) {
    if (Sentry?.captureException) {
      Sentry.captureException(error)
    }
    // biome-ignore lint/suspicious/noConsole: we need output from job executions
    console.error(error)
    const { ended, duration } = stopWatch.stop()

    const typedError = error as {
      message?: string
      stack?: string
    }

    await prismaClient.jobExecution
      .update({
        where: { id },
        data: {
          error: typedError.message || 'Unknown error',
          errored: ended,
        },
      })
      .catch((persistenceError) => {
        if (Sentry?.captureException) {
          Sentry.captureException(persistenceError)
        }
      })

    return {
      status: 'error',
      duration,
      error: {
        message: typedError.message || 'Unknown error',
        stack: typedError.stack || undefined,
      },
    }
  }
}
