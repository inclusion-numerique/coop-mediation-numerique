import z from 'zod'
import { ApplyCorrigerAdresseJobValidation } from './apply-corriger-adresse/applyCorrigerAdresseJob'
import { ApplyCorrigerCoordonneesJobValidation } from './apply-corriger-coordonnees/applyCorrigerCoordonneesJob'
import { ApplyFusionnerLieuxJobValidation } from './apply-fusionner-lieux/applyFusionnerLieuxJob'
import { ApplyReviewToActionPlanJobValidation } from './apply-review-to-action-plan/applyReviewToActionPlanJob'
import { ApplySupprimerLieuxJobValidation } from './apply-supprimer-lieux/applySupprimerLieuxJob'
import { ApplyViderSiretJobValidation } from './apply-vider-siret/applyViderSiretJob'
import { AuditAdresseCoherenceJobValidation } from './audit-adresse-coherence/auditAdresseCoherenceJob'
import { AuditLieuxOverviewJobValidation } from './audit-lieux-overview/auditLieuxOverviewJob'
import { AuditSiretCoherenceJobValidation } from './audit-siret-coherence/auditSiretCoherenceJob'
import { BackfillCommuneRdvspJobValidation } from './backfill-commune-rdvsp/backfillCommuneRdvspJob'
import { BackfillPersonnesAffectationsMainJobValidation } from './backfill-personnes-affectations-main/backfillPersonnesAffectationsMainJob'
import { BackfillStructureEmployeuseMainJobValidation } from './backfill-structure-employeuse-main/backfillStructureEmployeuseMainJob'
import { BackfillTrancheAgeJobValidation } from './backfill-tranche-age/backfillTrancheAgeJob'
import { BackupDatabaseJobValidation } from './backup-database/backupDatabaseJob'
import { CompleterStructuresMainJobValidation } from './completer-structures-main/completerStructuresMainJob'
import { CorrigerEmployeusesSansSiretJobValidation } from './corriger-employeuses-sans-siret/corrigerEmployeusesSansSiretJob'
import { CouvrirEmployeusesRestantesJobValidation } from './couvrir-employeuses-restantes/couvrirEmployeusesRestantesJob'
import { DeduplicateEmployeusesJobValidation } from './deduplicate-employeuses/deduplicateEmployeusesJob'
import { DeduplicateLieuxJobValidation } from './deduplicate-lieux/deduplicateLieuxJob'
import { DetectDuplicateLieuxJobValidation } from './detect-duplicate-lieux/detectDuplicateLieuxJob'
import { ExportDuplicateSiretsJobValidation } from './export-duplicate-sirets/exportDuplicateSiretsJob'
import { FixStructuresJobValidation } from './fix-structures/fixStructuresJob'
import { FixTagsJobValidation } from './fix-tags/fixTagsJob'
import { FixUsersJobValidation } from './fix-users/fixUsersJob'
import { FixUsersRolesJobValidation } from './fix-users-roles/fixUsersRolesJob'
import { ImportContactsToBrevoValidation } from './import-contacts-to-brevo/ImportContactsToBrevoJob'
import { InactiveUsersRemindersJobValidation } from './inactive-users-reminders/inactiveUsersJob'
import { LinkEmployeusesMainJobValidation } from './link-employeuses-main/linkEmployeusesMainJob'
import { NormaliserBeneficiairesJobValidation } from './normaliser-beneficiaires/normaliserBeneficiairesJob'
import { NormalizeSiretsJobValidation } from './normalize-sirets/normalizeSiretsJob'
import { RelierPersonnesCoopMainJobValidation } from './relier-personnes-coop-main/relierPersonnesCoopMainJob'
import { RemoveOrphanBrevoContactsJobValidation } from './remove-orphan-brevo-contacts/removeOrphanBrevoContactsJob'
import { ResetInscriptionsSansRoleJobValidation } from './reset-inscriptions-sans-role/resetInscriptionsSansRoleJob'
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
  ApplyReviewToActionPlanJobValidation,
  ApplyCorrigerAdresseJobValidation,
  ApplyCorrigerCoordonneesJobValidation,
  ApplyFusionnerLieuxJobValidation,
  ApplySupprimerLieuxJobValidation,
  ApplyViderSiretJobValidation,
  AuditAdresseCoherenceJobValidation,
  AuditSiretCoherenceJobValidation,
  AuditLieuxOverviewJobValidation,
  BackfillCommuneRdvspJobValidation,
  NormaliserBeneficiairesJobValidation,
  BackfillTrancheAgeJobValidation,
  BackupDatabaseJobValidation,
  CompleterStructuresMainJobValidation,
  RelierPersonnesCoopMainJobValidation,
  BackfillPersonnesAffectationsMainJobValidation,
  BackfillStructureEmployeuseMainJobValidation,
  UpdateStructuresCartographieNationaleJobValidation,
  ImportContactsToBrevoValidation,
  NormalizeSiretsJobValidation,
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
  ResetInscriptionsSansRoleJobValidation,
  DeduplicateLieuxJobValidation,
  CouvrirEmployeusesRestantesJobValidation,
  DeduplicateEmployeusesJobValidation,
  LinkEmployeusesMainJobValidation,
  CorrigerEmployeusesSansSiretJobValidation,
  DetectDuplicateLieuxJobValidation,
  ExportDuplicateSiretsJobValidation,
])

export type Job = z.infer<typeof JobValidation>

export type JobName = Job['name']

export type JobPayload<Name extends JobName> = Extract<
  Job,
  { name: Name }
>['payload']
