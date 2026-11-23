'use client'

import { ElementDuMenu } from '../../../ui/ElementDuMenu'
import { type TagAffiche } from '../../../ui/tag-affiche'
import { ModificationDUnTag } from './ModaleDeModification'

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
