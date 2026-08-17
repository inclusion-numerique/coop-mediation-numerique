import type { ParticipationId } from './participation-id'
import type { StatutPresence } from './statut-presence'
import type { UsagerId } from './usager-id'

/**
 * Présence d'un usager à un rendez-vous. Son statut est indépendant de celui du
 * rendez-vous : un atelier collectif honoré peut compter un absent.
 */
export type Participation = {
  readonly id: ParticipationId
  readonly usagerId: UsagerId
  readonly statutPresence: StatutPresence
  readonly notificationRappel: boolean
  readonly notificationsCycleDeVie: boolean
}
