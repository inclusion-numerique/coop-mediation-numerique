export { type AuteurSuppression } from './auteur-suppression'
export { effacementPlan } from './effacement-plan'
export {
  ErasedCount,
  failureReasonOf,
  type NomEffacementStep,
  report,
  type StepResult,
} from './effacement-report'
export {
  AccesNonCoupe,
  CompteIntrouvable,
  type SupprimerCompteError,
} from './errors'
export { motifDe } from './motif-suppression'
export type {
  Hash,
  RetirerDesListesDeDiffusion,
  SupprimerComptePorts,
} from './ports'
export { RetentionPolicy } from './retention-policy'
export { autoriserSuppression, type CompteSupprime } from './supprimer-compte'
