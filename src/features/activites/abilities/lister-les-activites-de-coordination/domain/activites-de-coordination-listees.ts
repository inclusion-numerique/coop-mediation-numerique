import type {
  ActiviteDeCoordination,
  Effectif,
  NomDeTag,
  Periode,
  TagId,
} from '../../../domain'

export type ActivitesDeCoordinationListees = {
  readonly activites: readonly ActiviteDeCoordination[]
  readonly total: Effectif
  readonly pages: Effectif
}

type TagDisponible = {
  readonly id: TagId
  readonly nom: NomDeTag
}

export type OptionsDeFiltre = {
  readonly tags: readonly TagDisponible[]
  readonly periodeCouverte: Periode | null
}
