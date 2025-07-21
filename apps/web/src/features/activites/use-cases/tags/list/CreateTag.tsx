'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import CreateTagModal, {
  CreateTagDynamicModal,
} from '../../tags/create/CreateTagModal'

export const CreateTag = ({
  isMediateur,
  isCoordinateur,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
}) => (
  <>
    <CreateTagModal isMediateur={isMediateur} isCoordinateur={isCoordinateur} />
    <Button
      type="button"
      priority="secondary"
      iconId="fr-icon-add-line"
      onClick={CreateTagDynamicModal.open}
    >
      Créer&nbsp;un&nbsp;tag
    </Button>
  </>
)
