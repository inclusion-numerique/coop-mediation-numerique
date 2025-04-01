import { BackupDatabaseJobValidation } from '@app/web/jobs/backup-database/backupDatabaseJob'
import { FixCoordinationsV1JobValidation } from '@app/web/jobs/fix-coordinations-v1/FixCoordinationsV1Job'
import { FixStructuresJobValidation } from '@app/web/jobs/fix-structures/fixStructuresJob'
import { ImportContactsToBrevoValidation } from '@app/web/jobs/import-contacts-to-brevo/ImportContactsToBrevoJob'
import { ImportCrasConseillerNumeriqueV1JobValidation } from '@app/web/jobs/import-cras-conseiller-numerique-v1/ImportCrasConseillerNumeriqueV1Job'
import { IngestLesBasesInRagValidation } from '@app/web/jobs/ingest-les-bases-in-rag/ingestLesBasesInRagJob'
import { SetServciesToSharedLieuxValidation } from '@app/web/jobs/set-servcies-to-shared-lieux/setServciesToSharedLieuxJob'
import { UpdateConumStructureReferentJobValidation } from '@app/web/jobs/update-conum-structure-referent/UpdateConumStructureReferentJob'
import { UpdateLieuxActivitesAdistanceValidation } from '@app/web/jobs/update-lieu-activite-a-distance/updateLieuxActivitesAdistanceJob'
import { UpdateStructuresCartographieNationaleJobValidation } from '@app/web/jobs/update-structures-cartographie-nationale/updateStructuresCartographieNationaleJob'
import z from 'zod'

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
  ImportCrasConseillerNumeriqueV1JobValidation,
  FixCoordinationsV1JobValidation,
  UpdateConumStructureReferentJobValidation,
  ImportContactsToBrevoValidation,
  IngestLesBasesInRagValidation,
  SetServciesToSharedLieuxValidation,
  UpdateLieuxActivitesAdistanceValidation,
  FixStructuresJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

export type JobPayload<Name extends JobName> = Extract<
  Job,
  { name: Name }
>['payload']
