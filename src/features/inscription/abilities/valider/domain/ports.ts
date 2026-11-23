import type { UserId } from '@/features/inscription/domain'
import type {
  FaitsInscription,
  ValidationAEnregistrer,
} from './valider-inscription'

/**
 * Lit les faits d'inscription bruts requis par `valider`. Lecture propre à cette
 * ability : contrairement à `getInscriptionEtat`, elle ne collapse pas « profil
 * posé, CGU absentes » en `NonDemarree` — valider pose justement les CGU.
 */
export type LireFaitsInscription = (userId: UserId) => Promise<FaitsInscription>

/** Projette la validation décidée sur la ligne `user` (pose les CGU si absentes). */
export type EnregistrerValidation = (input: {
  readonly userId: UserId
  readonly aEnregistrer: ValidationAEnregistrer
}) => Promise<void>

export type EffetsApresValidation = (userId: UserId) => Promise<void>

export type InscrireALaListeDeDiffusion = (userId: UserId) => Promise<void>
