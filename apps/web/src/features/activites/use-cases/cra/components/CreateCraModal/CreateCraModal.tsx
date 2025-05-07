'use client'

import React from 'react'
import CreateCraModalContent from './CreateCraModalContent'
import { CreateCraModalDefinition } from './CreateCraModalDefinition'

const CreateCraModal = () => (
  <CreateCraModalDefinition.Component title="Compléter un compte-rendu d’activité">
    <CreateCraModalContent onClose={CreateCraModalDefinition.close} />
  </CreateCraModalDefinition.Component>
)

export default CreateCraModal
