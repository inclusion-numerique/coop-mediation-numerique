import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { RdvStatusFilterValue } from '../features/activites/use-cases/list/validation/ActivitesFilters'
import type { OAuthApiRdvStatus } from './OAuthRdvApiCallInput'

// We use the same statuses as RDVSP but for an "unknown" status, we differenciate between "past" and "unknown" which means "to come"
export type RdvStatus = OAuthApiRdvStatus | 'past'

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
