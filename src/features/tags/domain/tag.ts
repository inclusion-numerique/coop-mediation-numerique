import type { DescriptionDuTag } from './description-du-tag'
import type { NomDuTag } from './nom-du-tag'
import type { Portee } from './portee'
import type { TagId } from './tag-id'

export type Tag = {
  readonly id: TagId
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly portee: Portee
}
