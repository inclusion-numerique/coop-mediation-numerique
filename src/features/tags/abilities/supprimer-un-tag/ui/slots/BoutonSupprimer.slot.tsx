'use client'

import { ElementDuMenu } from '../../../../ui/components/ElementDuMenu'
import { type TagAffiche } from '../../../../ui/presenters/tag-affiche'
import { SuppressionDuTag } from '../components/ModaleDeSuppression'

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
