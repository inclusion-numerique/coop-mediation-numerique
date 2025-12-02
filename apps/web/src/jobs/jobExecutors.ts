import { prismaClient } from '@app/web/prismaClient'
import { createStopwatch } from '@app/web/utils/stopwatch'
import * as Sentry from '@sentry/nextjs'
import { v4 } from 'uuid'
import {
  downloadCartographieNationaleStructures,
  getStructuresCartographieNationaleFromLocalFile,
} from '../data/cartographie-nationale/cartographieNationaleStructures'
import { executeBackupDatabaseJob } from './backup-database/executeBackupDatabaseJob'
import { executeFixCoordinationsV1 } from './fix-coordinations-v1/executeFixCoordinationsV1'
import { executeFixStructures } from './fix-structures/executeFixStructures'
import { executeFixTags } from './fix-tags/executeFixTags'
import { executeFixUsers } from './fix-users/executeFixUsers'
import { executeFixUsersRoles } from './fix-users-roles/executeFixUsersRoles'
import { executeImportContactsToBrevo } from './import-contacts-to-brevo/executeImportContactsToBrevo'
import { executeIncompleteSignupReminders } from './incomplete-signup-reminders/executeIncompleteSignupReminders'
import { executeIngestLesBasesInRag } from './ingest-les-bases-in-rag/executeIngestLesBasesInRag'
import type { Job, JobName, JobPayload } from './jobs'
import { output } from './output'
import { executeSetServciesToSharedLieux } from './set-servcies-to-shared-lieux/executeSetServciesToSharedLieux'
import { executeSyncConums } from './sync-conums/executeSyncConums'
import { executeSyncRdvspData } from './sync-rdvsp-data/executeSyncRdvspData'
import { executeUpdateConumInfo } from './update-conum-info/executeUpdateConumInfo'
import { executeUpdateConumStructureReferent } from './update-conum-structure-referent/executeUpdateConumStructureReferent'
import { executeUpdateLieuxActivitesADistance } from './update-lieu-activite-a-distance/executeUpdateLieuxActivitesADistance'
import { updateStructureFromCartoDataApi } from './update-structures-cartographie-nationale/updateStructureFromCartoDataApi'

export type JobExecutor<Name extends JobName, Result = unknown> = (
  job: Job & { name: Name; payload: JobPayload<Name> },
) => Promise<Result>

const executeUpdateStructuresCartographieNationale = async () => {
  output.log(
    `update-structures-carto: fetching existing and cartographie nationale dataset`,
  )

  await downloadCartographieNationaleStructures()

  const structuresCartographieNationale =
    await getStructuresCartographieNationaleFromLocalFile()

  const execute = updateStructureFromCartoDataApi({
    structuresCartographieNationale,
  })

  return await execute()
}

// Create an object that for each JobName, MUST has a JobExecutor<Name>
export const jobExecutors: {
  [Name in JobName]: JobExecutor<Name>
} = {
  'backup-database': executeBackupDatabaseJob,
  'update-structures-cartographie-nationale':
    executeUpdateStructuresCartographieNationale,
  'fix-coordinations-v1': executeFixCoordinationsV1,
  'update-conum-structure-referent': executeUpdateConumStructureReferent,
  'import-contacts-to-brevo': executeImportContactsToBrevo,
  'ingest-les-bases-in-rag': executeIngestLesBasesInRag,
  'set-servcies-to-shared-lieux': executeSetServciesToSharedLieux,
  'update-lieux-activites-a-distance': executeUpdateLieuxActivitesADistance,
  'fix-structures': executeFixStructures,
  'update-conum-info': executeUpdateConumInfo,
  'fix-users': executeFixUsers,
  'fix-tags': executeFixTags,
  'sync-conums': executeSyncConums,
  'sync-rdvsp-data': executeSyncRdvspData,
  'incomplete-signup-reminders': executeIncompleteSignupReminders,
  'fix-users-roles': executeFixUsersRoles,
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
