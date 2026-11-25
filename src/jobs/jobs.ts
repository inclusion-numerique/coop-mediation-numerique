import { z } from 'zod'
import { AnonymiserLesComptesInactifsJobValidation } from './anonymiser-les-comptes-inactifs/anonymiser-les-comptes-inactifs.job'
import { InactiveUsersRemindersJobValidation } from './inactive-users-reminders/inactive-users-reminders.job'
import { RemoveOrphanBrevoContactsJobValidation } from './remove-orphan-brevo-contacts/remove-orphan-brevo-contacts.job'
import { RetirerLesRolesVacantsJobValidation } from './retirer-les-roles-vacants/retirer-les-roles-vacants.job'
import { SyncRdvspDataJobValidation } from './sync-rdvsp-data/sync-rdvsp-data.job'
import { SynchroniserLesRolesBrevoJobValidation } from './synchroniser-les-roles-brevo/synchroniser-les-roles-brevo.job'

/**
 * A job represents a task that can be executed asynchronously.
 * It is run by a Scaleway Serverless Job (see `jobs` in infrastructure/locals.tf)
 * or by the cli.
 *
 * Each job must have an executor defined in job-executors.ts
 *
 * A job result should be serializable to JSON and never include sensitive data as it can be logged or stored for audit purposes.
 *
 * It is defined by a name and a payload (that can be optional).
 * The payload should be serializable to JSON.
 *
 * Add your jobs here.
 *
 * N'y figurent que les jobs qui ont encore une raison de tourner. Les campagnes
 * de reprise de données, les correctifs ponctuels et les backfills accomplis
 * sont supprimés une fois passés : leur trace vit dans `job_executions` et dans
 * l'historique git, pas dans le code.
 */

export const JobValidation = z.discriminatedUnion('name', [
  AnonymiserLesComptesInactifsJobValidation,
  InactiveUsersRemindersJobValidation,
  RemoveOrphanBrevoContactsJobValidation,
  RetirerLesRolesVacantsJobValidation,
  SyncRdvspDataJobValidation,
  SynchroniserLesRolesBrevoJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

type JobPayload<Name extends JobName> = Extract<Job, { name: Name }>['payload']

export type JobExecutor<Name extends JobName, Result = unknown> = (
  job: Job & { name: Name; payload: JobPayload<Name> },
) => Promise<Result>
