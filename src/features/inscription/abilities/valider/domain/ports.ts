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

export type InscrireALaListeDeDiffusion = (
  userId: UtilisateurId,
) => Promise<void>

export type ValiderPorts = {
  readonly lireFaitsInscription: LireFaitsInscription
  readonly enregistrerValidation: EnregistrerValidation
  readonly inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion
  readonly effetsApresValidation: EffetsApresValidation
}
