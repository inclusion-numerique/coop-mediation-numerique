import { MergeDiff } from '@app/web/libs/ui/administration/MergeDiff'
import type { MergeLieuInclusionData, MergeLieuInclusionInfo } from '../types'

const mergeFields: { label: string; key: keyof MergeLieuInclusionData }[] = [
  { label: 'Employés', key: 'employesIds' },
  { label: 'Médiateurs en activité', key: 'mediateursEnActiviteIds' },
  { label: 'Activités (employeur)', key: 'activitesEmployeurIds' },
  { label: 'Activités (lieu)', key: 'activitesLieuIds' },
  { label: 'Typologies', key: 'typologies' },
  { label: 'Services', key: 'services' },
  { label: 'Publics adressés', key: 'publicsSpecifiquementAdresses' },
  { label: 'Prise en charge', key: 'priseEnChargeSpecifique' },
  { label: "Modalités d'accompagnement", key: 'modalitesAccompagnement' },
  { label: "Modalités d'accès", key: 'modalitesAcces' },
  { label: 'Courriels', key: 'courriels' },
]

export const MergeLieuInclusionPreview = ({
  merge,
  common,
  source,
}: {
  merge: MergeLieuInclusionInfo
  common: MergeLieuInclusionData
  source?: MergeLieuInclusionData
}) => (
  <>
    <h2 className="fr-h6 fr-flex fr-flex-gap-2v">
      <span
        className={source == null ? 'ri-close-circle-line' : 'ri-building-line'}
        aria-hidden
      />
      <span className="fr-flex fr-direction-column">
        {merge.nom}
        <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
          {merge.adresse}, {merge.codePostal} {merge.commune}
        </span>
      </span>
    </h2>
    <ul>
      {mergeFields.map(({ label, key }) => (
        <li key={key}>
          {label}&nbsp;: {merge[key].length}
          <MergeDiff
            isAddition={source != null}
            sourceIds={source?.[key] ?? merge[key]}
            commonIds={common[key]}
          />
        </li>
      ))}
    </ul>
  </>
)
