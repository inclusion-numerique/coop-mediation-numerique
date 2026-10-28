import type { Acteur } from '../../../domain'
import { tagAffiche } from '../../../ui/tag-affiche.presenter'
import type { DestinationDeFusion } from '../domain'
import type { DestinationAffichee } from './destination-affichee'

export const destinationsAffichees = (
  acteur: Acteur,
  destinations: readonly DestinationDeFusion[],
): readonly DestinationAffichee[] =>
  destinations.map(({ tag, utilisations }) => ({
    tag: tagAffiche(acteur)(tag),
    accompagnements: utilisations,
  }))
