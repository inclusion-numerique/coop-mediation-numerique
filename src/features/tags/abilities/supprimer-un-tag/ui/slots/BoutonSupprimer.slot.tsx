'use client'

import { ElementDuMenu } from '../../../../ui/components/ElementDuMenu'
import { type TagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import { SuppressionDuTag } from './ModaleDeSuppression.slot'

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
