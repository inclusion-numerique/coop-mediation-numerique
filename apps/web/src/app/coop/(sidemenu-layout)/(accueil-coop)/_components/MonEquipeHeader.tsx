import { Button } from '@codegouvfr/react-dsfr/Button'

const MonEquipeHeader = () => (
  <div className="fr-flex fr-flex-wrap fr-flex-gap-4v fr-align-items-center fr-justify-content-space-between fr-mb-3w">
    <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
      <span className="ri-group-2-line fr-mr-1w" aria-hidden />
      Mon équipe
    </h2>
    <Button
      priority="tertiary no outline"
      size="small"
      linkProps={{
        href: '/coop/mon-equipe',
      }}
      iconId="fr-icon-arrow-right-line"
      iconPosition="right"
    >
      Voir mon équipe
    </Button>
  </div>
)

export default MonEquipeHeader
