import type { ParticipationId } from './participation-id'
import type { StatutPresence } from './statut-presence'
import type { Usager } from './usager'
import type { UsagerId } from './usager-id'

/**
 * Présence d'un usager à un rendez-vous. Son statut est indépendant de celui du
 * rendez-vous : un atelier collectif honoré peut compter un absent.
 *
 * L'usager est porté en entier, et pas seulement son identifiant : la
 * synchronisation le reçoit dans le même appel que le rendez-vous et doit
 * pouvoir l'enregistrer sans retourner le chercher.
 */
export type Participation = {
  readonly id: ParticipationId
  readonly usagerId: UsagerId
  readonly usager: Usager
  readonly statutPresence: StatutPresence
  readonly notificationRappel: boolean
  readonly notificationsCycleDeVie: boolean
}
