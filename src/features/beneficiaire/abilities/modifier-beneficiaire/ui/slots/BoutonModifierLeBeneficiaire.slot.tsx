import Button from '@codegouvfr/react-dsfr/Button'
import { hrefDeModificationDuBeneficiaire } from '@/features/beneficiaire/ui/presenters/liens.presenter'

export const BoutonModifierLeBeneficiaire = ({
  beneficiaireId,
}: {
  beneficiaireId: string
}) => (
  <Button
    iconId="fr-icon-edit-line"
    iconPosition="right"
    size="small"
    priority="tertiary no outline"
    linkProps={{
      href: hrefDeModificationDuBeneficiaire(beneficiaireId),
    }}
  >
    Modifier
  </Button>
)
