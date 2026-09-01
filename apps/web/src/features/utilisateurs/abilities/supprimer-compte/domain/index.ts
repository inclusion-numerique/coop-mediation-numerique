export {
  type AuteurSuppression,
  CouloirAutomatique,
  couloirsAutomatiques,
} from './auteur-suppression'
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
  EffacerEmpreinteRdv,
  EffacerNotes,
  Hash,
  LibererDesEquipes,
  RetirerDesLieux,
  RetirerDesListesDeDiffusion,
  RevoquerPartageStatistiques,
  SupprimerComptePorts,
} from './ports'
export { autoriserSuppression, type CompteSupprime } from './supprimer-compte'
