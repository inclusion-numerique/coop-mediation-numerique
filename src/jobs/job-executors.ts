import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { signaler } from '@/configuration/telemetry/serveur'
import { createStopwatch } from '@/libraries/chronometre'
import { executeAnonymiserLesComptesInactifs } from './anonymiser-les-comptes-inactifs/anonymiser-les-comptes-inactifs.execution'
import { executeInactiveUsersReminders } from './inactive-users-reminders/inactive-users-reminders.execution'
import type { Job, JobName, JobPayload } from './jobs'
import { executeRemoveOrphanBrevoContacts } from './remove-orphan-brevo-contacts/remove-orphan-brevo-contacts.execution'
import { executeRetirerLesRolesVacants } from './retirer-les-roles-vacants/retirer-les-roles-vacants.execution'
import { executeSyncRdvspData } from './sync-rdvsp-data/sync-rdvsp-data.execution'
import { executeSynchroniserLesRolesBrevo } from './synchroniser-les-roles-brevo/synchroniser-les-roles-brevo.execution'

export type JobExecutor<Name extends JobName, Result = unknown> = (
  job: Job & { name: Name; payload: JobPayload<Name> },
) => Promise<Result>

// Create an object that for each JobName, MUST has a JobExecutor<Name>
const jobExecutors: {
  [Name in JobName]: JobExecutor<Name>
} = {
  'anonymiser-les-comptes-inactifs': executeAnonymiserLesComptesInactifs,
  'inactive-users-reminders': executeInactiveUsersReminders,
  'remove-orphan-brevo-contacts': executeRemoveOrphanBrevoContacts,
  'retirer-les-roles-vacants': executeRetirerLesRolesVacants,
  'sync-rdvsp-data': executeSyncRdvspData,
  'synchroniser-les-roles-brevo': executeSynchroniserLesRolesBrevo,
}

export const executeJob = async (job: Job) => {
  const stopWatch = createStopwatch()

  const id = v4()

  await prismaClient.jobExecution.create({
    data: {
      id,
      name: job.name,
      ...(job.payload === undefined ? {} : { data: job.payload }),
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
        signaler(error)
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
    signaler(error)
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
        signaler(persistenceError)
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
