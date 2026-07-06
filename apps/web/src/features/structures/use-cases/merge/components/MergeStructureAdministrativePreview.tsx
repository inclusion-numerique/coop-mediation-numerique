import type { ReactNode } from 'react'
import type { MergeStructureAdministrativeData } from '../queries/getMergeStructureAdministrativePreviewPageData'

type Employeuse = MergeStructureAdministrativeData['mergeSource']

type IdentityKey =
  | 'siret'
  | 'rna'
  | 'denomination'
  | 'nomReferent'
  | 'courrielReferent'
  | 'telephoneReferent'

const identityFields: { label: string; key: IdentityKey }[] = [
  { label: 'SIRET', key: 'siret' },
  { label: 'RNA', key: 'rna' },
  { label: 'Dénomination', key: 'denomination' },
  { label: 'Nom du référent', key: 'nomReferent' },
  { label: 'Courriel du référent', key: 'courrielReferent' },
  { label: 'Téléphone du référent', key: 'telephoneReferent' },
]

const Addition = ({ children }: { children: ReactNode }) => (
  <span className="fr-text--bold fr-text-label--green-bourgeon fr-mb-0">
    &nbsp;
    <span className="ri-add-line" aria-hidden />
    {children}
  </span>
)

// Rendu deux fois : sans `source` = carte SOURCE (supprimée) ; avec `source` = carte CIBLE
// (conservée), qui montre l'impact — emplois/activités reçus et champs d'identité complétés.
export const MergeStructureAdministrativePreview = ({
  employeuse,
  source,
}: {
  employeuse: Employeuse
  source?: Employeuse
}) => (
  <>
    <h2 className="fr-h6 fr-flex fr-flex-gap-2v">
      <span
        className={source == null ? 'ri-close-circle-line' : 'ri-building-line'}
        aria-hidden
      />
      <span className="fr-flex fr-direction-column">
        {employeuse.nom}
        <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
          {employeuse.adresse}, {employeuse.codePostal} {employeuse.commune}
        </span>
      </span>
    </h2>
    <ul>
      <li>
        Emplois&nbsp;: {employeuse._count.emplois}
        {source != null && source._count.emplois > 0 ? (
          <Addition>jusqu’à {source._count.emplois}</Addition>
        ) : null}
      </li>
      <li>
        Activités-employeur&nbsp;: {employeuse._count.activites}
        {source != null && source._count.activites > 0 ? (
          <Addition>{source._count.activites}</Addition>
        ) : null}
      </li>
      {identityFields.map(({ label, key }) => (
        <li key={key}>
          {label}&nbsp;: {employeuse[key] ?? '—'}
          {source != null && !employeuse[key] && source[key] ? (
            <Addition>{source[key]}</Addition>
          ) : null}
        </li>
      ))}
    </ul>
  </>
)
