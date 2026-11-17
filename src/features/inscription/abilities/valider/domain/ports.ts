import type { UserId } from '@app/web/features/inscription/domain'
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

/**
 * Effets consécutifs à la validation, hors du chemin de l'écriture : synchro du
 * contact Brevo et, pour un médiateur, acceptation des invitations d'équipe en
 * attente (liens de coordination). Idempotents, rejouables sans dommage.
 */
export type EffetsApresValidation = (userId: UserId) => Promise<void>
