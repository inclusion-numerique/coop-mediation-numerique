import type { ActiviteId } from './activite-id'
import type { Horodatage } from './horodatage'

export type CriteresDExposition = {
  readonly creeesDepuis: Horodatage | null
  readonly modifieesDepuis: Horodatage | null
}

export type CurseurDActivite = {
  readonly modification: Horodatage
  readonly id: ActiviteId
}
