import { Button } from '@codegouvfr/react-dsfr/Button'
import { CreateCraModalDefinition } from './CreateCraModalDefinition'

export const BoutonEnregistrerUneActivite = () => (
  <Button
    type="button"
    {...CreateCraModalDefinition.buttonProps}
    className="fr-quick-action"
  >
    <span className="ri-add-line ri-2x fr-mr-3w fr-text--regular" aria-hidden />
    Enregistrer une activité
  </Button>
)
