'use client'

import { ElementDuMenu } from '../../../../ui/components/ElementDuMenu'
import { FusionDUnTag, type TagAFusionner } from './ModaleDeFusion.slot'

export const BoutonFusionner = (source: TagAFusionner) => {
  const ouvrir = FusionDUnTag.useOpen()

  return (
    <ElementDuMenu
      icone="fr-icon-git-merge-fill"
      libelle="Fusionner"
      onClick={() => ouvrir(source)}
    />
  )
}
