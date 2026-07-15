import type { InscriptionEnCours } from '@app/web/features/inscription/domain'
import type { RolesACreer } from './roles-a-creer'

/**
 * Projette l'état d'inscription résultant du choix sur l'utilisateur et
 * garantit les comptes de rôle correspondants. Les deux voyagent ensemble car
 * ils doivent être posés d'une seule écriture : un profil sans compte de rôle
 * est précisément l'état fantôme qu'on refuse de pouvoir produire.
 */
export type EnregistrerProfilChoisi = (input: {
  readonly etat: InscriptionEnCours
  readonly roles: RolesACreer
}) => Promise<void>
