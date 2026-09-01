export { type AuteurSuppression } from './auteur-suppression'
export { effacementPlan } from './effacement-plan'
export {
  type EffacementReport,
  EffacementStep,
  ErasedCount,
  effacementSteps,
  FailureReason,
  isComplete,
  report,
  type StepResult,
} from './effacement-report'
export {
  AccesNonCoupe,
  CompteDejaSupprime,
  CompteIntrouvable,
  RoleProtege,
  type SupprimerCompteError,
} from './errors'
export {
  MotifSuppression,
  motifDe,
  motifsSuppression,
} from './motif-suppression'
export type {
  AnonymiserPortefeuille,
  DetacherDesEquipes,
  EffacerEmpreinteRdv,
  EffacerNotes,
  Hash,
  RetirerDesLieux,
  RetirerDesListesDeDiffusion,
  RevoquerPartageStatistiques,
  SupprimerComptePorts,
} from './ports'
export {
  RetentionPolicy,
  retentionPolicies,
} from './retention-policy'
export { autoriserSuppression, type CompteSupprime } from './supprimer-compte'
