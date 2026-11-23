'use client'

import CreateCraModalContent from '@/features/activites/ui/saisie/modale-de-saisie/CreateCraModalContent'
import { CreateCraModalDefinition } from '@/features/activites/ui/saisie/modale-de-saisie/modale-de-saisie'

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
