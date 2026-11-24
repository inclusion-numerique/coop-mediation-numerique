'use client'

import type { MouseEventHandler } from 'react'
import { DetailDeLActiviteDynamicModal } from '../../../../ui/components/DetailDeLActiviteModale'
import type { LigneDuTableau } from '../presenters/mes-activites.presenter'

export const OuvrirLeDetailDeLaLigne = ({ row }: { row: LigneDuTableau }) => {
  const ouvrir = DetailDeLActiviteDynamicModal.useOpen()
  const onClick: MouseEventHandler = (event) => {
    ouvrir(row.detail)
    event.preventDefault()
    event.stopPropagation()
  }
  return (
    <button
      type="button"
      className="fr-p-0"
      title="Voir le détail"
      onClick={onClick}
    />
  )
}
