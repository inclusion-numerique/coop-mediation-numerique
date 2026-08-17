import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { RdvStatusFilterValue } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import type { statutsPresence } from '../domain/statut-presence'

/**
 * Statuts de RDV Service Public, plus `past` que La Coop dérive de l'heure de
 * fin — voir `domain/statut-rdv`, qui porte la même distinction sous le nom
 * `passe`. Les deux coexistent tant que les filtres d'activités écrivent `past`
 * dans les URLs.
 */
export type RdvStatus = (typeof statutsPresence)[number] | 'past'

export const rdvStatusLabels: {
  [key in RdvStatus]: string
} = {
  unknown: 'À venir',
  past: 'Passé',
  seen: 'Honoré',
  revoked: 'Annulé',
  excused: 'Annulé par bénéficiaire',
  noshow: 'Absence',
}
export const rdvStatusPluralLabels: {
  [key in RdvStatus]: string
} = {
  unknown: 'À venir',
  past: 'Passés',
  seen: 'Honorés',
  revoked: 'Annulés',
  excused: 'Annulés par bénéficiaire',
  noshow: 'Absence',
}

export const rdvStatusOptions = labelsToOptions(rdvStatusLabels)

export const rdvStatusValues = Object.keys(rdvStatusPluralLabels) as [
  RdvStatus,
  ...RdvStatus[],
]
