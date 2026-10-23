import { z } from 'zod'
import { AnonymiserLesComptesInactifsJobValidation } from './anonymiser-les-comptes-inactifs/anonymiserLesComptesInactifsJob'
import { FixUsersRolesJobValidation } from './fix-users-roles/fixUsersRolesJob'
import { InactiveUsersRemindersJobValidation } from './inactive-users-reminders/inactiveUsersJob'
import { RemoveOrphanBrevoContactsJobValidation } from './remove-orphan-brevo-contacts/removeOrphanBrevoContactsJob'
import { ReprendreLesDonneesDesLieuxJobValidation } from './reprendre-les-donnees-des-lieux/reprendreLesDonneesDesLieuxJob'
import { SyncRdvspDataJobValidation } from './sync-rdvsp-data/syncRdvspDataJob'
import { SynchroniserLesRolesBrevoJobValidation } from './synchroniser-les-roles-brevo/synchroniserLesRolesBrevoJob'

/**
 * A job represents a task that can be executed asynchronously.
 * It is run by a Scaleway Serverless Job (see `jobs` in infrastructure/locals.tf)
 * or by the cli.
 *
 * Each job must have an executor defined in jobExecutors.ts
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
  FixUsersRolesJobValidation,
  InactiveUsersRemindersJobValidation,
  RemoveOrphanBrevoContactsJobValidation,
  ReprendreLesDonneesDesLieuxJobValidation,
  SyncRdvspDataJobValidation,
  SynchroniserLesRolesBrevoJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

export type JobPayload<Name extends JobName> = Extract<
  Job,
  { name: Name }
>['payload']
