'use client'

import type { MouseEventHandler } from 'react'
import { ActiviteDetailsDynamicModal } from '@app/web/components/activite/ActiviteDetailsModal/ActiviteDetailsDynamicModal'
import type { ActiviteForList } from '@app/web/cra/activitesQueries'

const ActiviteRowShowDetailsButton = ({ row }: { row: ActiviteForList }) => {
  const open = ActiviteDetailsDynamicModal.useOpen()

  const onClick: MouseEventHandler = (event) => {
    open({
      activite: row,
    })
    event.preventDefault()
    event.stopPropagation()
  }

  // eslint-disable-next-line jsx-a11y/control-has-associated-label
  return <button type="button" title="Voir le détail" onClick={onClick} />
}
export default ActiviteRowShowDetailsButton
