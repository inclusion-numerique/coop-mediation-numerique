import { formationLabelLabels } from '@app/web/features/structures/formationLabel'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { FormationLabel, Typologie } from '@prisma/client'

export const DescriptionView = ({
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
    <div>
      <span className="fr-text-mention--grey">Formations et labels</span>
      {(formationsLabels?.length ?? 0) > 0 ? (
        <ul className="fr-tags-group fr-mt-3v">
          {formationsLabels?.map((formationLabel) => (
            <li key={formationLabel}>
              <Tag>{formationLabelLabels[formationLabel]}</Tag>
            </li>
          ))}
        </ul>
      ) : (
        <div className="fr-text--medium">Non renseigné</div>
      )}
    </div>
  </div>
)
