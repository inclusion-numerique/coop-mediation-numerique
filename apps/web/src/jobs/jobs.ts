import z from 'zod'
import { AuditAdresseCoherenceJobValidation } from './audit-adresse-coherence/auditAdresseCoherenceJob'
import { AuditSiretCoherenceJobValidation } from './audit-siret-coherence/auditSiretCoherenceJob'
import { AuditStructuresOverviewJobValidation } from './audit-structures-overview/auditStructuresOverviewJob'
import { BackupDatabaseJobValidation } from './backup-database/backupDatabaseJob'
import { DeduplicateStructuresJobValidation } from './deduplicate-structures/deduplicateStructuresJob'
import { GenerateStructuresActionPlanJobValidation } from './generate-structures-action-plan/generateStructuresActionPlanJob'
import { DetectDuplicateStructuresJobValidation } from './detect-duplicate-structures/detectDuplicateStructuresJob'
import { ExportDuplicateSiretsJobValidation } from './export-duplicate-sirets/exportDuplicateSiretsJob'
import { FixStructuresJobValidation } from './fix-structures/fixStructuresJob'
import { FixTagsJobValidation } from './fix-tags/fixTagsJob'
import { FixUsersJobValidation } from './fix-users/fixUsersJob'
import { FixUsersRolesJobValidation } from './fix-users-roles/fixUsersRolesJob'
import { ImportContactsToBrevoValidation } from './import-contacts-to-brevo/ImportContactsToBrevoJob'
import { InactiveUsersRemindersJobValidation } from './inactive-users-reminders/inactiveUsersJob'
import { NormalizeStructuresEmployeusesJobValidation } from './normalize-structures-employeuses/normalizeStructuresEmployeusesJob'
import { RemoveOrphanBrevoContactsJobValidation } from './remove-orphan-brevo-contacts/removeOrphanBrevoContactsJob'
import { SetServciesToSharedLieuxValidation } from './set-servcies-to-shared-lieux/setServciesToSharedLieuxJob'
import { SyncRdvspDataJobValidation } from './sync-rdvsp-data/syncRdvspDataJob'
import { SyncUsersFromDataspaceJobValidation } from './sync-users-from-dataspace/syncUsersFromDataspaceJob'
import { UpdateLieuxActivitesAdistanceValidation } from './update-lieu-activite-a-distance/updateLieuxActivitesAdistanceJob'
import { UpdateStructuresCartographieNationaleJobValidation } from './update-structures-cartographie-nationale/updateStructuresCartographieNationaleJob'

/**
 * A job represents a task that can be executed asynchronously.
 * It can be triggered by a POST to /api/jobs
 * It could also be triggered by a cli or as a side effect of a mutation.
 *
 * Each job must have an executor defined in jobExecutors.ts
 *
 * A job result should be serializable to JSON and never include sensitive data as it can be logged or stored for audit purposes.
 *
 * It is defined by a name and a payload (that can be optional).
 * The payload should be serializable to JSON for easily being passed as POST data.
 *
 * Add your jobs here.
 * To add a cron trigger, see WebAppStack Jobs definitions.
 */

export const JobValidation = z.discriminatedUnion('name', [
  AuditAdresseCoherenceJobValidation,
  AuditSiretCoherenceJobValidation,
  AuditStructuresOverviewJobValidation,
  BackupDatabaseJobValidation,
  UpdateStructuresCartographieNationaleJobValidation,
  ImportContactsToBrevoValidation,
  NormalizeStructuresEmployeusesJobValidation,
  SetServciesToSharedLieuxValidation,
  UpdateLieuxActivitesAdistanceValidation,
  FixStructuresJobValidation,
  FixUsersJobValidation,
  SyncUsersFromDataspaceJobValidation,
  SyncRdvspDataJobValidation,
  FixTagsJobValidation,
  InactiveUsersRemindersJobValidation,
  FixUsersRolesJobValidation,
  RemoveOrphanBrevoContactsJobValidation,
  DeduplicateStructuresJobValidation,
  DetectDuplicateStructuresJobValidation,
  ExportDuplicateSiretsJobValidation,
  GenerateStructuresActionPlanJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

export type JobPayload<Name extends JobName> = Extract<
  Job,
  { name: Name }
>['payload']
