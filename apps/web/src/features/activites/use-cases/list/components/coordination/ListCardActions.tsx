import { formatInTimeZone } from 'date-fns-tz'
import { ActivitesByDate } from '../../db/getCoordinationsListPageData'

export const ListCardActions = ({
  activite,
  timezone,
}: {
  activite: ActivitesByDate['activites'][number]
  timezone: string
}) => (
  <span className="fr-text--xs fr-mb-0">
    Enregistré le{' '}
    {formatInTimeZone(activite.creation, timezone, 'dd.MM.yyyy à HH:mm')}
  </span>
)
