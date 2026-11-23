import Button from '@codegouvfr/react-dsfr/Button'

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
      href: `/coop/mes-beneficiaires/${beneficiaireId}/modifier`,
    }}
  >
    Modifier
  </Button>
)
