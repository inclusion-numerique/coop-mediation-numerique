import { MergeDiff } from '@app/web/libs/ui/administration/MergeDiff'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { ChampsPartageables, LieuAFusionner } from '../../domain'
import { nomAffiche } from '../nom-affiche'

const mergeFields: { label: string; key: keyof ChampsPartageables }[] = [
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

/**
 * L'adresse en une ligne, telle qu'on la lit. Un lieu sans adresse valide reste
 * affichable : c'est souvent celui qu'on est venu fusionner.
 */
const adresseAffichee = (adresse: LieuAFusionner['adresse']): string =>
  adresse == null
    ? 'Adresse non renseignée'
    : `${toTitleCase(adresse.voie, { noUpper: true })}, ${adresse.code_postal} ${toTitleCase(adresse.commune)}`

export const ApercuDeLaFusion = ({
  merge,
  common,
  source,
}: {
  merge: LieuAFusionner
  common: ChampsPartageables
  source?: ChampsPartageables
}) => (
  <>
    <h2 className="fr-h6 fr-flex fr-flex-gap-2v">
      <span
        className={source == null ? 'ri-close-circle-line' : 'ri-building-line'}
        aria-hidden
      />
      <span className="fr-flex fr-direction-column">
        {nomAffiche(merge.nom)}
        <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
          {adresseAffichee(merge.adresse)}
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
