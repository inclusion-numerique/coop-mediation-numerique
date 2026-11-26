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

export type AccepterLesInvitations = (
  userId: UtilisateurId,
) => Promise<Result<void, EchecTechnique>>

export type SignalerLEchec = (echec: EchecTechnique) => void

export type LireLeContactAInscrire<Contact> = (
  userId: UtilisateurId,
) => Promise<Contact | null>

export type InscrireALaListeDeDiffusion<Contact> = (
  contact: Contact,
) => Promise<void>

export type ValiderPorts<Contact> = {
  readonly lireFaitsInscription: LireFaitsInscription
  readonly enregistrerValidation: EnregistrerValidation
  readonly lireLeContactAInscrire: LireLeContactAInscrire<Contact>
  readonly inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion<Contact>
  readonly accepterLesInvitations: AccepterLesInvitations
  readonly signaler: SignalerLEchec
}
