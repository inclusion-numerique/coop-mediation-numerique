'use client'

import CreateCraModalContent from '@/features/activites/ui/components/saisie/CreateCraModalContent'
import { CreateCraModalDefinition } from '@/features/activites/ui/components/saisie/modale-de-saisie'

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
