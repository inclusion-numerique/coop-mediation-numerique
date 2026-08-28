import type { InscriptionEnCours } from '@app/web/features/inscription/domain'
import type { RolesACreer } from './roles-a-creer'

/**
 * Charge d'écriture décidée par `choisirProfil` : l'état d'inscription résultant
 * du choix et les comptes de rôle à garantir. Les deux voyagent ensemble car ils
 * doivent être posés d'une seule écriture — un profil sans compte de rôle est
 * précisément l'état fantôme qu'on refuse de pouvoir produire.
 */
export type EnregistrerProfilChoisiInput = {
  readonly etat: InscriptionEnCours
  readonly roles: RolesACreer
}

/** Projette la charge décidée sur l'utilisateur en une seule écriture. */
export type EnregistrerProfilChoisi = (
  input: EnregistrerProfilChoisiInput,
) => Promise<void>
