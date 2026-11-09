'use client'

import { ElementDuMenu } from '../../../ui'
import { FusionDUnTag, type TagAFusionner } from './ModaleDeFusion'

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
