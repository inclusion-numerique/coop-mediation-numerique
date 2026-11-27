import type { DescriptionDuTag, NomDuTag, Portee, TagId } from '../../../domain'

export type EnregistrerUnTag = (tag: {
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly portee: Portee
}) => Promise<TagId>

export type CreerUnTagPorts = {
  readonly enregistrer: EnregistrerUnTag
}
