import Button from '@codegouvfr/react-dsfr/Button'

export const BoutonDocumentation = () => (
  <Button
    iconId="fr-icon-file-text-line"
    linkProps={{ href: '/api/v1/documentation', target: '_blank' }}
    className="fr-mr-2v"
    priority="secondary"
  >
    Documentation
  </Button>
)
