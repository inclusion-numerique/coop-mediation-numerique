'use client'

import { ActiviteDetailsDynamicModal } from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsDynamicModal'
import { ActiviteListItem } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import type { MouseEventHandler } from 'react'

const ActiviteCardOpenModalLink = ({
  activite,
}: {
  activite: ActiviteListItem
}) => {
  const open = ActiviteDetailsDynamicModal.useOpen()

  const onClick: MouseEventHandler = (event) => {
    open({
      activite,
    })
    event.preventDefault()
    event.stopPropagation()
  }

  return <button type="button" title="Voir le détail" onClick={onClick} />
}

export default ActiviteCardOpenModalLink
