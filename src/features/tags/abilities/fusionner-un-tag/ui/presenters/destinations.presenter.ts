import type { Acteur } from '../../../../domain'
import { tagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import type { DestinationAffichee } from '../../action/rechercher-des-destinations.key'
import type { DestinationDeFusion } from '../../domain'

export const destinationsAffichees = (
  acteur: Acteur,
  destinations: readonly DestinationDeFusion[],
): readonly DestinationAffichee[] =>
  destinations.map(({ tag, utilisations }) => ({
    tag: tagAffiche(acteur)(tag),
    accompagnements: utilisations,
  }))
