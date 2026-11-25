'use client'

import { type DataTableSelection } from '@/libraries/data-table/selection'
import { DataTable } from '@/libraries/data-table/table'
import type { LiensDeLaListe } from '../filtres/liste-des-beneficiaires.filtre'
import type { BeneficiaireRow } from '../presenters/ligne-du-beneficiaire.presenter'
import { BeneficiairesTableHead } from './BeneficiairesTableHead'
import { BeneficiaireTableRow } from './BeneficiaireTableRow'

export const BeneficiairesTable = ({
  rows,
  colonnes,
  selection,
}: {
  rows: readonly BeneficiaireRow[]
  colonnes: LiensDeLaListe['colonnes']
  selection: DataTableSelection
}) => (
  <DataTable className="fr-mb-8v">
    <BeneficiairesTableHead
      colonnes={colonnes}
      allSelected={selection.allSelected}
      someSelected={selection.someSelected}
      onToggleAll={selection.toggleAll}
    />
    <tbody>
      {rows.map((row) => (
        <BeneficiaireTableRow
          key={row.id}
          row={row}
          selected={selection.selectedIds.has(row.id)}
          onToggle={selection.toggle}
        />
      ))}
    </tbody>
  </DataTable>
)
