'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { SaveTagDynamicModal } from '../save/SaveTagModal'

export const CreateTag = () => {
  const openSaveTagModal = SaveTagDynamicModal.useOpen()

  return (
    <Button
      type="button"
      priority="secondary"
      iconId="fr-icon-add-line"
      onClick={() => openSaveTagModal({})}
    >
      Créer&nbsp;un&nbsp;tag
    </Button>
  )
}
