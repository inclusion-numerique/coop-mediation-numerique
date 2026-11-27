import type { UtilisateurId } from '@/features/inscription/domain'
import type { Result } from '@/libraries/result'
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

export type AccepterLesInvitations<Acceptation, Echec> = (entree: {
  readonly userId: UtilisateurId
  readonly maintenant: Date
}) => Promise<Result<Acceptation, Echec>>

export type SignalerLEchec<Echec> = (echec: Echec) => void

export type InscrireALaListeDeDiffusion<Inscription> = (entree: {
  readonly utilisateurId: UtilisateurId
}) => Promise<Result<Inscription, never>>

export type ValiderPorts<Inscription, Acceptation, Echec> = {
  readonly lireFaitsInscription: LireFaitsInscription
  readonly enregistrerValidation: EnregistrerValidation
  readonly inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion<Inscription>
  readonly accepterLesInvitations: AccepterLesInvitations<Acceptation, Echec>
  readonly signaler: SignalerLEchec<Echec>
}
