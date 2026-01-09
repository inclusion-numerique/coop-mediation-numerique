import z from 'zod'
import { BackupDatabaseJobValidation } from './backup-database/backupDatabaseJob'
import { FixCoordinationsV1JobValidation } from './fix-coordinations-v1/FixCoordinationsV1Job'
import { FixStructuresJobValidation } from './fix-structures/fixStructuresJob'
import { FixTagsJobValidation } from './fix-tags/fixTagsJob'
import { FixUsersJobValidation } from './fix-users/fixUsersJob'
import { FixUsersRolesJobValidation } from './fix-users-roles/fixUsersRolesJob'
import { ImportContactsToBrevoValidation } from './import-contacts-to-brevo/ImportContactsToBrevoJob'
import { InactiveUsersRemindersJobValidation } from './inactive-users-reminders/inactiveUsersJob'
import { IngestLesBasesInRagValidation } from './ingest-les-bases-in-rag/ingestLesBasesInRagJob'
import { SetServciesToSharedLieuxValidation } from './set-servcies-to-shared-lieux/setServciesToSharedLieuxJob'
import { SyncConumsJobValidation } from './sync-conums/syncConumsJob'
import { SyncRdvspDataJobValidation } from './sync-rdvsp-data/syncRdvspDataJob'
import { UpdateConumInfoValidation } from './update-conum-info/UpdateConumInfoJob'
import { UpdateConumStructureReferentJobValidation } from './update-conum-structure-referent/UpdateConumStructureReferentJob'
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
  BackupDatabaseJobValidation,
  UpdateStructuresCartographieNationaleJobValidation,
  FixCoordinationsV1JobValidation,
  UpdateConumStructureReferentJobValidation,
  ImportContactsToBrevoValidation,
  IngestLesBasesInRagValidation,
  SetServciesToSharedLieuxValidation,
  UpdateLieuxActivitesAdistanceValidation,
  FixStructuresJobValidation,
  UpdateConumInfoValidation,
  FixUsersJobValidation,
  SyncConumsJobValidation,
  SyncRdvspDataJobValidation,
  FixTagsJobValidation,
  InactiveUsersRemindersJobValidation,
  FixUsersRolesJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

export type JobPayload<Name extends JobName> = Extract<
  Job,
  { name: Name }
>['payload']
