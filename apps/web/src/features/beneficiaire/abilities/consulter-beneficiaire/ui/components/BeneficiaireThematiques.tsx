import Tag from '@codegouvfr/react-dsfr/Tag'

export type ThematiqueAbordee = {
  readonly thematique: string
  readonly libelle: string
  readonly nombre: number
}

const BeneficiaireThematiques = ({
  thematiques,
}: {
  thematiques: readonly ThematiqueAbordee[]
}) => (
  <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
    <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-0">
      Thématiques d’accompagnements
    </h4>
    <p className="fr-text--xs fr-text-mention--grey fr-mb-4v">
      Retrouvez les thématiques d’accompagnements vues avec ce bénéficiaire.
    </p>
    {thematiques.length > 0 ? (
      <div className="fr-flex fr-flex-wrap fr-flex-gap-3v">
        {thematiques.map(({ thematique, libelle, nombre }) => (
          <Tag key={thematique}>
            {libelle}
            {nombre > 1 ? (
              <>
                &nbsp;·&nbsp;
                <span className="fr-text--bold">{nombre}</span>
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
