import type {
  DescriptionDuTag,
  Effectif,
  NomDuTag,
  TagId,
  TypeDePortee,
} from '../../../domain'
import type { Proportion } from './proportion'

export type TagLePlusUtilise = {
  readonly id: TagId
  readonly nom: NomDuTag
  readonly portee: TypeDePortee
  readonly description: DescriptionDuTag | null
  readonly utilisations: Effectif
  readonly accompagnements: Effectif
}

export type UsageDesTags = {
  readonly createursDeTagsUtilises: Proportion
  readonly activitesAvecUnTag: Proportion
  readonly tagsLesPlusUtilises: readonly TagLePlusUtilise[]
}
