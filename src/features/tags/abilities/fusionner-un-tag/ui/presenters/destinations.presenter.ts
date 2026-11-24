import type { Acteur } from '../../../../domain'
import type { TagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import { tagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import type { DestinationDeFusion } from '../../domain'

export type DestinationAffichee = {
  readonly tag: TagAffiche
  readonly accompagnements: number
}

export const destinationsAffichees = (
  acteur: Acteur,
  destinations: readonly DestinationDeFusion[],
): readonly DestinationAffichee[] =>
  destinations.map(({ tag, utilisations }) => ({
    tag: tagAffiche(acteur)(tag),
    accompagnements: utilisations,
  }))
