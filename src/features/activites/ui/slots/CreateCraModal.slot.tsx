'use client'

import CreateCraModalContent from '@/features/activites/ui/components/saisie/CreateCraModalContent'
import { ModaleDeSaisie } from '@/features/activites/ui/slots/ModaleDeSaisie.slot'

const CreateCraModal = ({
  isMediateur,
  isCoordinateur,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
}) => (
  <ModaleDeSaisie.Component title="Compléter un compte-rendu d’activité">
    <CreateCraModalContent
      onClose={ModaleDeSaisie.close}
      isMediateur={isMediateur}
      isCoordinateur={isCoordinateur}
    />
  </ModaleDeSaisie.Component>
)

export default CreateCraModal
