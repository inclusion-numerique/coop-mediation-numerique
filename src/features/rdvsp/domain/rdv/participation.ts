import type { ParticipationId } from '../identifiants/participation-id'
import type { UsagerId } from '../identifiants/usager-id'
import type { Usager } from '../usager'
import type { StatutPresence } from './statut-presence'

export type Participation = {
  readonly id: ParticipationId
  readonly usagerId: UsagerId
  readonly usager: Usager
  readonly statutPresence: StatutPresence
  readonly notificationRappel: boolean
  readonly notificationsCycleDeVie: boolean
}
