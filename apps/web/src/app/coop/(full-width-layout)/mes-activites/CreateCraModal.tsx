'use client'

import React from 'react'
import CreateCraModalContent from '@app/web/app/coop/(full-width-layout)/mes-activites/CreateCraModalContent'
import { CreateCraModalDefinition } from '@app/web/app/coop/(full-width-layout)/mes-activites/CreateCraModalDefinition'

const CreateCraModal = () => (
  <CreateCraModalDefinition.Component title="Compléter un compte-rendu d’activité">
    <CreateCraModalContent onClose={CreateCraModalDefinition.close} />
  </CreateCraModalDefinition.Component>
)

export default CreateCraModal
