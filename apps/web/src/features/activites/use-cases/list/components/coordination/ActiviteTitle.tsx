import { ActivitesByDate } from '../../db/getCoordinationsListPageData'
import { displayTypeActivite } from './displayTypeActivite'

export const ActiviteTitle = ({
  activite,
}: {
  activite: ActivitesByDate['activites'][number]
}) => (
  <>
    {displayTypeActivite[activite.type].label}
    {activite.nomEvenement ? <>&nbsp;·&nbsp;{activite.nomEvenement}</> : null}
  </>
)
