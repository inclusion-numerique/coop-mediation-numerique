import { ReactNode } from 'react'
import { ActivitesByDate } from '../../db/getCoordinationsListPageData'
import { CountWithLabel } from './CountWithLabel'

export const ActiviteInfo = ({
  activite,
  prefix,
}: {
  activite: ActivitesByDate['activites'][number]
  prefix?: ReactNode
}) => (
  <>
    <CountWithLabel
      count={activite.participants ?? 0}
      label="participant"
      prefix={prefix}
    />
    <CountWithLabel
      count={activite.partenaires ?? 0}
      label="partenaire"
      prefix={prefix}
    />
  </>
)
