import {
  appliquerLaReconciliation,
  lireLesLieuxCarto,
  reconcilierAvecLaCartographie,
} from '@app/web/features/lieux-activite/abilities/reconcilier-avec-la-cartographie'
import {
  effacerLeSiret,
  interrogerSirene,
  lireLesLieuxASiret,
  marquerLeSiretVerifie,
  sansEcriture,
  verifierLesSiretsDesLieux,
} from '@app/web/features/lieux-activite/abilities/verifier-les-sirets-des-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { createStopwatch } from '@app/web/utils/stopwatch'
import * as Sentry from '@sentry/nextjs'
import { v4 } from 'uuid'
import { executeAppliquerDispositifConum } from './appliquer-dispositif-conum/executeAppliquerDispositifConum'
import { executeFixUsersRoles } from './fix-users-roles/executeFixUsersRoles'
import { executeInactiveUsersReminders } from './inactive-users-reminders/executeInactiveUsersReminders'
import type { Job, JobName, JobPayload } from './jobs'
import { output } from './output'
import { executeRemoveOrphanBrevoContacts } from './remove-orphan-brevo-contacts/executeRemoveOrphanBrevoContacts'
import { executeSyncRdvspData } from './sync-rdvsp-data/executeSyncRdvspData'

export type JobExecutor<Name extends JobName, Result = unknown> = (
  job: Job & { name: Name; payload: JobPayload<Name> },
) => Promise<Result>

const executeUpdateStructuresCartographieNationale = async () => {
  const journal = (message: string) =>
    output.log(`update-structures-carto: ${message}`)

  journal('lecture des lieux de la cartographie depuis l’Entrepôt')

  return reconcilierAvecLaCartographie({
    ports: {
      lireLesLieuxCarto,
      appliquerLaReconciliation: appliquerLaReconciliation(journal),
    },
  })
}

const JOUR_EN_MS = 24 * 60 * 60 * 1000

const executeNormalizeSirets: JobExecutor<'normalize-sirets'> = async (job) => {
  const dryRun = job.payload?.dryRun ?? false
  const minDaysSinceLastSync = job.payload?.minDaysSinceLastSync ?? 7

  const journal = (message: string) =>
    output.log(`normalize-sirets: ${message}`)

  journal(
    `démarrage${dryRun ? ' (À BLANC)' : ''}, on saute les lieux confrontés depuis moins de ${minDaysSinceLastSync} jours`,
  )

  const compte = await verifierLesSiretsDesLieux({
    command: {
      verifiesDepuis: new Date(Date.now() - minDaysSinceLastSync * JOUR_EN_MS),
    },
    ports: {
      lireLesLieuxASiret,
      interrogerSirene,
      journal,
      // Une passe à blanc est la même vérification menée avec des ports qui
      // n'écrivent pas : le compte est celui qu'on obtiendrait.
      ...(dryRun ? sansEcriture : { effacerLeSiret, marquerLeSiretVerifie }),
    },
  })

  journal(
    `terminé — ${compte.verifies} vérifiés, ${compte.siretsEffaces} SIRET effacés, ${compte.ignores} ignorés, ${compte.echecs} échecs${dryRun ? ' (À BLANC)' : ''}`,
  )

  return { ...compte, dryRun }
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
