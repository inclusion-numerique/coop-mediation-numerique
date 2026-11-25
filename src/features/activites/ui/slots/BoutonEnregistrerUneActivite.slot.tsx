import { Button } from '@codegouvfr/react-dsfr/Button'
import { ModaleDeSaisie } from './ModaleDeSaisie.slot'

export const BoutonEnregistrerUneActivite = () => (
  <Button
    type="button"
    {...ModaleDeSaisie.buttonProps}
    className="fr-quick-action"
  >
    <span
      className="ri-add-line fr-icon--lg fr-mr-3w fr-text--regular"
      aria-hidden
    />
    Enregistrer une activité
  </Button>
)
