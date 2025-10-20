'use client'

import React from 'react'
import CreateCraModalContent from './CreateCraModalContent'
import { CreateCraModalDefinition } from './CreateCraModalDefinition'

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
