'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { CreationDUnTag } from './ModaleDeCreation'

export const BoutonCreerUnTag = () => {
  const ouvrir = CreationDUnTag.useOpen()

  return (
    <Button
      type="button"
      priority="secondary"
      iconId="fr-icon-add-line"
      onClick={() => ouvrir({ nom: '' })}
    >
      Créer&nbsp;un&nbsp;tag
    </Button>
  )
}
