'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { GererRdvServicePublicModalInstance } from './GererRdvServicePublicModal'

const GererRdvServicePublicButton = () => (
  <Button
    type="button"
    priority="secondary"
    className="fr-mb-0"
    iconId="fr-icon-settings-5-line"
    iconPosition="right"
    {...GererRdvServicePublicModalInstance.buttonProps}
  >
    Gérer la connexion
  </Button>
)

export default GererRdvServicePublicButton
