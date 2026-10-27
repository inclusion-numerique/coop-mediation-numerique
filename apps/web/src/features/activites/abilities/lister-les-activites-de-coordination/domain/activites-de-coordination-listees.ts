import type {
  ActiviteDeCoordination,
  Effectif,
  NomDeTag,
  Periode,
  TagId,
} from '../../../domain'
import type { PorteeDeTag } from './portee-de-tag'

export type ActivitesDeCoordinationListees = {
  readonly activites: readonly ActiviteDeCoordination[]
  readonly total: Effectif
  readonly pages: Effectif
}

export type TagDisponible = {
  readonly id: TagId
  readonly nom: NomDeTag
  readonly portee: PorteeDeTag
}

export type OptionsDeFiltre = {
  readonly tags: readonly TagDisponible[]
  readonly periodeCouverte: Periode | null
}
