'use client'

import { ElementDuMenu } from '../../../../ui/components/ElementDuMenu'
import { type TagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import { ModificationDUnTag } from './ModaleDeModification.slot'

export const BoutonModifier = ({ tag }: { tag: TagAffiche }) => {
  const ouvrir = ModificationDUnTag.useOpen()

  return (
    <ElementDuMenu
      icone="fr-icon-edit-line"
      libelle="Modifier"
      onClick={() => ouvrir(tag)}
    />
  )
}
