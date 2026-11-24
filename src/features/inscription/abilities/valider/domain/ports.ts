import type { UtilisateurId } from '@/features/inscription/domain'
import type {
  FaitsInscription,
  ValidationAEnregistrer,
} from './valider-inscription'

/**
 * Lit les faits d'inscription bruts requis par `valider`. Lecture propre à cette
 * ability : contrairement à `getInscriptionEtat`, elle ne collapse pas « profil
 * posé, CGU absentes » en `NonDemarree` — valider pose justement les CGU.
 */
export type LireFaitsInscription = (
  userId: UtilisateurId,
) => Promise<FaitsInscription>

/** Projette la validation décidée sur la ligne `user` (pose les CGU si absentes). */
export type EnregistrerValidation = (input: {
  readonly userId: UtilisateurId
  readonly aEnregistrer: ValidationAEnregistrer
}) => Promise<void>

export type EffetsApresValidation = (userId: UtilisateurId) => Promise<void>

export type InscrireALaListeDeDiffusion = (
  userId: UtilisateurId,
) => Promise<void>
