import { Button } from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import { CreateCraModalDefinition } from '../../cra/components/CreateCraModal/CreateCraModalDefinition'

export const CoordinationEmptyState = () => (
  <div className="fr-text--center fr-background-alt--blue-france fr-p-6w fr-border-radius--16">
    <p className="fr-h6 fr-text--lg fr-mb-1w">
      Vous n’avez pas encore enregistré d’activité de coordination
    </p>
    <p className="fr-mb-4w">
      Vous pouvez enregistrer votre première activité de coordination en
      cliquant sur ‘Enregistrer une activité’.
    </p>
    <Button
      type="button"
      {...CreateCraModalDefinition.buttonProps}
      iconId="fr-icon-add-line"
    >
      Enregistrer une activité
    </Button>
  </div>
)
