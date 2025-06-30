'use client'

import type { MouseEventHandler } from 'react'
import type { ActiviteListItem } from '../db/activitesQueries'
import { ActiviteDetailsDynamicModal } from './ActiviteDetailsModal/ActiviteDetailsDynamicModal'

const ActiviteRowShowDetailsButton = ({ row }: { row: ActiviteListItem }) => {
  const open = ActiviteDetailsDynamicModal.useOpen()

  const onClick: MouseEventHandler = (event) => {
    open({
      activite: row,
    })
    event.preventDefault()
    event.stopPropagation()
  }

  return <button type="button" title="Voir le détail" onClick={onClick} />
}
export default ActiviteRowShowDetailsButton
