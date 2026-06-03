import { prismaClient } from '@app/web/prismaClient'
import { createStopwatch } from '@app/web/utils/stopwatch'
import * as Sentry from '@sentry/nextjs'
import { v4 } from 'uuid'
import { fetchCartographieNationaleStructures } from '../data/cartographie-nationale/cartographieNationaleStructures'
import { executeApplyCorrigerAdresse } from './apply-corriger-adresse/executeApplyCorrigerAdresse'
import { executeApplyCorrigerCoordonnees } from './apply-corriger-coordonnees/executeApplyCorrigerCoordonnees'
import { executeApplyFusionnerStructures } from './apply-fusionner-structures/executeApplyFusionnerStructures'
import { executeApplyReviewToActionPlan } from './apply-review-to-action-plan/executeApplyReviewToActionPlan'
import { executeApplySupprimerStructures } from './apply-supprimer-structures/executeApplySupprimerStructures'
import { executeApplyViderSiret } from './apply-vider-siret/executeApplyViderSiret'
import { executeAuditAdresseCoherence } from './audit-adresse-coherence/executeAuditAdresseCoherence'
import { executeAuditSiretCoherence } from './audit-siret-coherence/executeAuditSiretCoherence'
import { executeAuditStructuresOverview } from './audit-structures-overview/executeAuditStructuresOverview'
import { executeBackfillCommuneRdvsp } from './backfill-commune-rdvsp/executeBackfillCommuneRdvsp'
import { executeBackfillTrancheAge } from './backfill-tranche-age/executeBackfillTrancheAge'
import { executeBackupDatabaseJob } from './backup-database/executeBackupDatabaseJob'
import { executeDeduplicateStructures } from './deduplicate-structures/executeDeduplicateStructures'
import { executeDetectDuplicateStructures } from './detect-duplicate-structures/executeDetectDuplicateStructures'
import { executeExportDuplicateSirets } from './export-duplicate-sirets/executeExportDuplicateSirets'
import { executeFixStructures } from './fix-structures/executeFixStructures'
import { executeFixTags } from './fix-tags/executeFixTags'
import { executeFixUsers } from './fix-users/executeFixUsers'
import { executeFixUsersRoles } from './fix-users-roles/executeFixUsersRoles'
import { executeGenerateStructuresActionPlan } from './generate-structures-action-plan/executeGenerateStructuresActionPlan'
import { executeImportContactsToBrevo } from './import-contacts-to-brevo/executeImportContactsToBrevo'
import { executeInactiveUsersReminders } from './inactive-users-reminders/executeInactiveUsersReminders'
import type { Job, JobName, JobPayload } from './jobs'
import { executeNormalizeStructuresEmployeuses } from './normalize-structures-employeuses/executeNormalizeStructuresEmployeuses'
import { output } from './output'
import { executeRemoveOrphanBrevoContacts } from './remove-orphan-brevo-contacts/executeRemoveOrphanBrevoContacts'
import { executeSetServciesToSharedLieux } from './set-servcies-to-shared-lieux/executeSetServciesToSharedLieux'
import { executeSyncRdvspData } from './sync-rdvsp-data/executeSyncRdvspData'
import { executeSyncUsersFromDataspace } from './sync-users-from-dataspace/executeSyncUsersFromDataspace'
import { executeUpdateLieuxActivitesADistance } from './update-lieu-activite-a-distance/executeUpdateLieuxActivitesADistance'
import { updateStructureFromCartoDataApi } from './update-structures-cartographie-nationale/updateStructureFromCartoDataApi'

export type JobExecutor<Name extends JobName, Result = unknown> = (
  job: Job & { name: Name; payload: JobPayload<Name> },
) => Promise<Result>

const executeUpdateStructuresCartographieNationale = async () => {
  output.log(
    `update-structures-carto: fetching cartographie nationale dataset from dataspace`,
  )

  const structuresCartographieNationale =
    await fetchCartographieNationaleStructures()

  const execute = updateStructureFromCartoDataApi({
    structuresCartographieNationale,
  })

  return await execute()
}

// Create an object that for each JobName, MUST has a JobExecutor<Name>
export const jobExecutors: {
  [Name in JobName]: JobExecutor<Name>
} = {
  'apply-review-to-action-plan': executeApplyReviewToActionPlan,
  'apply-corriger-adresse': executeApplyCorrigerAdresse,
  'apply-corriger-coordonnees': executeApplyCorrigerCoordonnees,
  'apply-fusionner-structures': executeApplyFusionnerStructures,
  'apply-supprimer-structures': executeApplySupprimerStructures,
  'apply-vider-siret': executeApplyViderSiret,
  'audit-adresse-coherence': executeAuditAdresseCoherence,
  'audit-siret-coherence': executeAuditSiretCoherence,
  'audit-structures-overview': executeAuditStructuresOverview,
  'backfill-commune-rdvsp': executeBackfillCommuneRdvsp,
  'backfill-tranche-age': executeBackfillTrancheAge,
  'backup-database': executeBackupDatabaseJob,
  'update-structures-cartographie-nationale':
    executeUpdateStructuresCartographieNationale,
  'import-contacts-to-brevo': executeImportContactsToBrevo,
  'normalize-structures-employeuses': executeNormalizeStructuresEmployeuses,
  'set-servcies-to-shared-lieux': executeSetServciesToSharedLieux,
  'update-lieux-activites-a-distance': executeUpdateLieuxActivitesADistance,
  'fix-structures': executeFixStructures,
  'fix-users': executeFixUsers,
  'fix-tags': executeFixTags,
  'sync-users-from-dataspace': executeSyncUsersFromDataspace,
  'sync-rdvsp-data': executeSyncRdvspData,
  'inactive-users-reminders': executeInactiveUsersReminders,
  'fix-users-roles': executeFixUsersRoles,
  'remove-orphan-brevo-contacts': executeRemoveOrphanBrevoContacts,
  'deduplicate-structures': executeDeduplicateStructures,
  'detect-duplicate-structures': executeDetectDuplicateStructures,
  'export-duplicate-sirets': executeExportDuplicateSirets,
  'generate-structures-action-plan': executeGenerateStructuresActionPlan,
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
