import type { CraThematiqueCount } from '@app/web/beneficiaire/beneficiaireQueries'
import Tag from '@codegouvfr/react-dsfr/Tag'

const BeneficiaireThematiques = ({
  thematiquesCounts,
}: {
  thematiquesCounts: CraThematiqueCount[]
}) => (
  <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
    <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-0">
      Thématiques d’accompagnements
    </h4>
    <p className="fr-text--xs fr-text-mention--grey fr-mb-4v">
      Retrouvez les thématiques d’accompagnements vues avec ce bénéficiaire.
    </p>
    {thematiquesCounts.length > 0 ? (
      <div className="fr-flex fr-flex-wrap fr-flex-gap-3v">
        {thematiquesCounts.map(({ thematique, label, count }) => (
          <Tag key={thematique}>
            {label}
            {count > 1 ? (
              <>
                &nbsp;·&nbsp;
                <span className="fr-text--bold">{count}</span>
              </>
            ) : null}
          </Tag>
        ))}
      </div>
    ) : (
      <p className="fr-text--sm">-</p>
    )}
  </div>
)

export default BeneficiaireThematiques
