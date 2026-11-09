'use client'

import { ElementDuMenu, type TagAffiche } from '../../../ui'
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
