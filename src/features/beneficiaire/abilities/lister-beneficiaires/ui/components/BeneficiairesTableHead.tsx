import { SelectAllHeaderCell } from '@/libraries/data-table'
import { EnTeteTriable } from '@/libraries/etat-d-url/liste/EnTeteTriable'
import { beneficiairesColumns } from '../columns/beneficiaires.columns'
import type { LiensDeLaListe } from '../filtres/liste-des-beneficiaires.filtre'

export const BeneficiairesTableHead = ({
  colonnes,
  allSelected,
  someSelected,
  onToggleAll,
}: {
  colonnes: LiensDeLaListe['colonnes']
  allSelected: boolean
  someSelected: boolean
  onToggleAll: () => void
}) => (
  <thead>
    <tr>
      <SelectAllHeaderCell
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        onToggle={onToggleAll}
      />
      {beneficiairesColumns.map((column) => (
        <EnTeteTriable
          key={column.tri}
          libelle={column.label}
          lien={colonnes[column.tri]}
          className={column.alignRight ? 'fr-text--right' : undefined}
        />
      ))}
      <th className="fr-sr-only">Fiche bénéficiaire</th>
    </tr>
  </thead>
)
