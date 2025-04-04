'use client'

import { ActiviteDetailsDynamicModal } from '@app/web/components/activite/ActiviteDetailsModal/ActiviteDetailsDynamicModal'
import type { ActiviteForList } from '@app/web/cra/activitesQueries'
import type { MouseEventHandler } from 'react'

const ActiviteRowShowDetailsButton = ({ row }: { row: ActiviteForList }) => {
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
