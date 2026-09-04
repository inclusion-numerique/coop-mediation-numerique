import { z } from 'zod'
import { AppliquerDispositifConumJobValidation } from './appliquer-dispositif-conum/appliquerDispositifConumJob'
import { FixUsersRolesJobValidation } from './fix-users-roles/fixUsersRolesJob'
import { InactiveUsersRemindersJobValidation } from './inactive-users-reminders/inactiveUsersJob'
import { NormalizeSiretsJobValidation } from './normalize-sirets/normalizeSiretsJob'
import { RemoveOrphanBrevoContactsJobValidation } from './remove-orphan-brevo-contacts/removeOrphanBrevoContactsJob'
import { SyncRdvspDataJobValidation } from './sync-rdvsp-data/syncRdvspDataJob'
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
 *
 * N'y figurent que les jobs qui ont encore une raison de tourner. Les campagnes
 * de reprise de données, les correctifs ponctuels et les backfills accomplis
 * sont supprimés une fois passés : leur trace vit dans `job_executions` et dans
 * l'historique git, pas dans le code.
 */

export const JobValidation = z.discriminatedUnion('name', [
  AppliquerDispositifConumJobValidation,
  FixUsersRolesJobValidation,
  InactiveUsersRemindersJobValidation,
  NormalizeSiretsJobValidation,
  RemoveOrphanBrevoContactsJobValidation,
  SyncRdvspDataJobValidation,
  UpdateStructuresCartographieNationaleJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

export type JobPayload<Name extends JobName> = Extract<
  Job,
  { name: Name }
>['payload']
