import type { Acteur } from '../../../../domain'
import {
  type OptionDeVisibilite,
  visibilitesProposees,
} from '../../ui/presenters/visibilites.presenter'

export const visibilitesProposeesA = (
  acteur: Acteur,
): readonly OptionDeVisibilite[] => visibilitesProposees(acteur)
