import type {
  DescriptionDuTag,
  LireUnTagActif,
  NomDuTag,
  TagId,
} from '../../../domain'

export type EnregistrerLaModification = (modification: {
  readonly tagId: TagId
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
}) => Promise<void>

export type ModifierUnTagPorts = {
  readonly lireUnTagActif: LireUnTagActif
  readonly enregistrer: EnregistrerLaModification
}
