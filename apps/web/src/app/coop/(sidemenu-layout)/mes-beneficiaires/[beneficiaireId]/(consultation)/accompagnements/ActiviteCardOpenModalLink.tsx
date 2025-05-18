'use client'

import { ActiviteDetailsDynamicModal } from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsDynamicModal'
import { ActiviteForList } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import type { MouseEventHandler } from 'react'

const ActiviteCardOpenModalLink = ({
  activite,
}: {
  activite: ActiviteForList
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
