'use client'

import { ActivitesByDate } from '../../db/getCoordinationsListPageData'
import ListCard from '../ListCard'
import { ActiviteCoordinationDynamicModal } from './ActiviteCoordinationDynamicModal'
import { ActiviteInfo } from './ActiviteInfo'
import { ActivitePurpose } from './ActivitePurpose'
import { ActiviteTitle } from './ActiviteTitle'
import { displayTypeActivite } from './displayTypeActivite'
import { ListCardActions } from './ListCardActions'

export const CoordinationListCard = ({
  activite,
  date,
  timezone,
}: {
  activite: ActivitesByDate['activites'][number]
  date: string
  timezone: string
}) => {
  const openActiviteCoordinationModal =
    ActiviteCoordinationDynamicModal.useOpen()

  return (
    <ListCard
      as="button"
      contentTop={
        <>
          <ActiviteTitle activite={activite} />
          <ActiviteInfo activite={activite} prefix="&nbsp;·&nbsp;" />
        </>
      }
      contentBottom={<ActivitePurpose activite={activite} />}
      pictogram={displayTypeActivite[activite.type].pictogram}
      actions={<ListCardActions activite={activite} timezone={timezone} />}
      onClick={() => {
        openActiviteCoordinationModal({ activite, date })
      }}
    />
  )
}
