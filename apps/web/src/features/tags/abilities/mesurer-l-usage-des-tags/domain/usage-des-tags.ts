import type { DescriptionDuTag } from './description-du-tag'
import type { Effectif } from './effectif'
import type { NomDuTag } from './nom-du-tag'
import type { PorteeDuTag } from './portee-du-tag'
import type { Proportion } from './proportion'
import type { TagId } from './tag-id'

export type TagLePlusUtilise = {
  readonly id: TagId
  readonly nom: NomDuTag
  readonly portee: PorteeDuTag
  readonly description: DescriptionDuTag | null
  readonly utilisations: Effectif
  readonly accompagnements: Effectif
}

export type UsageDesTags = {
  readonly createursDeTagsUtilises: Proportion
  readonly activitesAvecUnTag: Proportion
  readonly tagsLesPlusUtilises: readonly TagLePlusUtilise[]
}
