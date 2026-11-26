import type { UtilisateurId } from '@/features/inscription/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type {
  FaitsInscription,
  ValidationAEnregistrer,
} from './valider-inscription'

export type LireFaitsInscription = (
  userId: UtilisateurId,
) => Promise<FaitsInscription>

export type EnregistrerValidation = (
  validation: ValidationAEnregistrer,
) => Promise<void>

export type AccepterLesInvitations = (entree: {
  readonly userId: UtilisateurId
  readonly maintenant: Date
}) => Promise<Result<void, EchecTechnique>>

export type SignalerLEchec = (echec: EchecTechnique) => void

export type InscrireALaListeDeDiffusion<Inscription> = (entree: {
  readonly utilisateurId: UtilisateurId
}) => Promise<Result<Inscription, never>>

export type ValiderPorts<Inscription> = {
  readonly lireFaitsInscription: LireFaitsInscription
  readonly enregistrerValidation: EnregistrerValidation
  readonly inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion<Inscription>
  readonly accepterLesInvitations: AccepterLesInvitations
  readonly signaler: SignalerLEchec
}
