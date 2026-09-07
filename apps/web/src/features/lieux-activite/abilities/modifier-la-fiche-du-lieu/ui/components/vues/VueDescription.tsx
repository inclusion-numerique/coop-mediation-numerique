import { FormationLabelPropose as FormationLabel } from '@app/web/features/lieux-activite/domain/nomenclatures'
import Tag from '@codegouvfr/react-dsfr/Tag'

export const VueDescription = ({
  presentationResume,
  presentationDetail,
  formationsLabels,
}: {
  presentationResume?: string | null
  presentationDetail?: string | null
  formationsLabels?: FormationLabel[] | null
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div>
      <span className="fr-text-mention--grey">Résumé</span>
      <div
        className="fr-text--medium"
        data-testid="description-presentation-resume"
      >
        {(presentationResume?.length ?? 0) > 0
          ? presentationResume
          : 'Non renseignée'}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">Présentation</span>
      <div
        className="fr-text--medium"
        data-testid="description-presentation-detail"
      >
        {presentationDetail ? (
          <div
            dangerouslySetInnerHTML={{
              __html: presentationDetail,
            }}
          />
        ) : (
          'Non renseigné'
        )}
      </div>
    </div>
    {/*
      Les formations et labels ne se saisissent qu'à la création du lieu : cette
      fiche n'offre aucun champ pour les renseigner. Annoncer « Non renseigné »
      y désignait donc un manque que le lecteur ne pouvait pas combler — on ne
      montre la rubrique que lorsqu'elle porte quelque chose.
    */}
    {formationsLabels != null && formationsLabels.length > 0 && (
      <div>
        <span className="fr-text-mention--grey">Formations et labels</span>
        <ul className="fr-tags-group fr-mt-3v">
          {formationsLabels.map((formationLabel) => (
            <li key={formationLabel}>
              <Tag>{formationLabel}</Tag>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)
