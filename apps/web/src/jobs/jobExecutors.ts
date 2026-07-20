import { prismaClient } from '@app/web/prismaClient'
import { createStopwatch } from '@app/web/utils/stopwatch'
import * as Sentry from '@sentry/nextjs'
import { v4 } from 'uuid'
import { executeAppliquerPlanCouverture } from './appliquer-plan-couverture/executeAppliquerPlanCouverture'
import { executeApplyCorrigerAdresse } from './apply-corriger-adresse/executeApplyCorrigerAdresse'
import { executeApplyCorrigerCoordonnees } from './apply-corriger-coordonnees/executeApplyCorrigerCoordonnees'
import { executeApplyFusionnerLieux } from './apply-fusionner-lieux/executeApplyFusionnerLieux'
import { executeApplyReviewToActionPlan } from './apply-review-to-action-plan/executeApplyReviewToActionPlan'
import { executeApplySupprimerLieux } from './apply-supprimer-lieux/executeApplySupprimerLieux'
import { executeApplyViderSiret } from './apply-vider-siret/executeApplyViderSiret'
import { executeAuditAdresseCoherence } from './audit-adresse-coherence/executeAuditAdresseCoherence'
import { executeAuditLieuxOverview } from './audit-lieux-overview/executeAuditLieuxOverview'
import { executeAuditSiretCoherence } from './audit-siret-coherence/executeAuditSiretCoherence'
import { executeBackfillCommuneRdvsp } from './backfill-commune-rdvsp/executeBackfillCommuneRdvsp'
import { executeBackfillPersonnesAffectationsMain } from './backfill-personnes-affectations-main/executeBackfillPersonnesAffectationsMain'
import { executeBackfillStructureEmployeuseMain } from './backfill-structure-employeuse-main/executeBackfillStructureEmployeuseMain'
import { executeBackfillTrancheAge } from './backfill-tranche-age/executeBackfillTrancheAge'
import { executeBackupDatabaseJob } from './backup-database/executeBackupDatabaseJob'
import { executeCompleterStructuresMain } from './completer-structures-main/executeCompleterStructuresMain'
import { executeCorrigerEmployeusesSansSiret } from './corriger-employeuses-sans-siret/executeCorrigerEmployeusesSansSiret'
import { executeCouvrirEmployeusesRestantes } from './couvrir-employeuses-restantes/executeCouvrirEmployeusesRestantes'
import { executeDeduplicateEmployeuses } from './deduplicate-employeuses/executeDeduplicateEmployeuses'
import { executeDeduplicateLieux } from './deduplicate-lieux/executeDeduplicateLieux'
import { executeDetectDuplicateLieux } from './detect-duplicate-lieux/executeDetectDuplicateLieux'
import { executeExportDuplicateSirets } from './export-duplicate-sirets/executeExportDuplicateSirets'
import { executeFixStructures } from './fix-structures/executeFixStructures'
import { executeFixTags } from './fix-tags/executeFixTags'
import { executeFixUsers } from './fix-users/executeFixUsers'
import { executeFixUsersRoles } from './fix-users-roles/executeFixUsersRoles'
import { executeImportContactsToBrevo } from './import-contacts-to-brevo/executeImportContactsToBrevo'
import { executeInactiveUsersReminders } from './inactive-users-reminders/executeInactiveUsersReminders'
import type { Job, JobName, JobPayload } from './jobs'
import { executeLinkEmployeusesMain } from './link-employeuses-main/executeLinkEmployeusesMain'
import { executeNormaliserBeneficiaires } from './normaliser-beneficiaires/executeNormaliserBeneficiaires'
import { executeNormalizeSirets } from './normalize-sirets/executeNormalizeSirets'
import { output } from './output'
import { executeRelierPersonnesCoopMain } from './relier-personnes-coop-main/executeRelierPersonnesCoopMain'
import { executeRemoveOrphanBrevoContacts } from './remove-orphan-brevo-contacts/executeRemoveOrphanBrevoContacts'
import { executeResetInscriptionsSansRole } from './reset-inscriptions-sans-role/executeResetInscriptionsSansRole'
import { executeSetServciesToSharedLieux } from './set-servcies-to-shared-lieux/executeSetServciesToSharedLieux'
import { executeSyncRdvspData } from './sync-rdvsp-data/executeSyncRdvspData'
import { executeSyncUsersFromDataspace } from './sync-users-from-dataspace/executeSyncUsersFromDataspace'
import { executeUpdateLieuxActivitesADistance } from './update-lieu-activite-a-distance/executeUpdateLieuxActivitesADistance'
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
  'apply-review-to-action-plan': executeApplyReviewToActionPlan,
  'apply-corriger-adresse': executeApplyCorrigerAdresse,
  'apply-corriger-coordonnees': executeApplyCorrigerCoordonnees,
  'apply-fusionner-lieux': executeApplyFusionnerLieux,
  'apply-supprimer-lieux': executeApplySupprimerLieux,
  'apply-vider-siret': executeApplyViderSiret,
  'audit-adresse-coherence': executeAuditAdresseCoherence,
  'audit-siret-coherence': executeAuditSiretCoherence,
  'audit-lieux-overview': executeAuditLieuxOverview,
  'backfill-commune-rdvsp': executeBackfillCommuneRdvsp,
  'backfill-tranche-age': executeBackfillTrancheAge,
  'backup-database': executeBackupDatabaseJob,
  'completer-structures-main': executeCompleterStructuresMain,
  'relier-personnes-coop-main': executeRelierPersonnesCoopMain,
  'backfill-personnes-affectations-main':
    executeBackfillPersonnesAffectationsMain,
  'backfill-structure-employeuse-main': executeBackfillStructureEmployeuseMain,
  'update-structures-cartographie-nationale':
    executeUpdateStructuresCartographieNationale,
  'import-contacts-to-brevo': executeImportContactsToBrevo,
  'normalize-sirets': executeNormalizeSirets,
  'normaliser-beneficiaires': executeNormaliserBeneficiaires,
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
  'reset-inscriptions-sans-role': executeResetInscriptionsSansRole,
  'deduplicate-lieux': executeDeduplicateLieux,
  'deduplicate-employeuses': executeDeduplicateEmployeuses,
  'corriger-employeuses-sans-siret': executeCorrigerEmployeusesSansSiret,
  'link-employeuses-main': executeLinkEmployeusesMain,
  'appliquer-plan-couverture': executeAppliquerPlanCouverture,
  'couvrir-employeuses-restantes': executeCouvrirEmployeusesRestantes,
  'detect-duplicate-lieux': executeDetectDuplicateLieux,
  'export-duplicate-sirets': executeExportDuplicateSirets,
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
