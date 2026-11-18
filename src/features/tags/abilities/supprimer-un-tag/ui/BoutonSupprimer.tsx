'use client'

import { ElementDuMenu, type TagAffiche } from '../../../ui'
import { SuppressionDuTag } from './ModaleDeSuppression'

export const BoutonSupprimer = ({ tag }: { tag: TagAffiche }) => {
  const ouvrir = SuppressionDuTag.useOpen()

  return (
    <ElementDuMenu
      icone="fr-icon-delete-bin-line"
      libelle="Supprimer"
      onClick={() => ouvrir(tag)}
    />
  )
}
