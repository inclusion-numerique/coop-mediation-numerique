'use client'

import CreateCraModalContent from '@app/web/features/activites/ui/saisie/CreateCraModal/CreateCraModalContent'
import { CreateCraModalDefinition } from '@app/web/features/activites/ui/saisie/CreateCraModal/CreateCraModalDefinition'

const CreateCraModal = ({
  isMediateur,
  isCoordinateur,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
}) => (
  <CreateCraModalDefinition.Component title="Compléter un compte-rendu d’activité">
    <CreateCraModalContent
      onClose={CreateCraModalDefinition.close}
      isMediateur={isMediateur}
      isCoordinateur={isCoordinateur}
    />
  </CreateCraModalDefinition.Component>
)

export default CreateCraModal
