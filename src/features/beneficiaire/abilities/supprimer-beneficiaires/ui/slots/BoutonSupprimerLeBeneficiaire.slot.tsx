import Button from '@codegouvfr/react-dsfr/Button'
import { DeleteBeneficiaireModal } from '../components/DeleteBeneficiaireModal'

export const BoutonSupprimerLeBeneficiaire = () => (
  <Button
    iconId="fr-icon-delete-bin-line"
    className="fr-ml-1v"
    iconPosition="right"
    size="small"
    priority="tertiary no outline"
    type="button"
    {...DeleteBeneficiaireModal.buttonProps}
  >
    Supprimer
  </Button>
)
