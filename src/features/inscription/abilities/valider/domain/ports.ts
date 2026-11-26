import type { UtilisateurId } from '@/features/inscription/domain'
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

export type EffetsApresValidation = (userId: UtilisateurId) => Promise<void>

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
  readonly effetsApresValidation: EffetsApresValidation
}
