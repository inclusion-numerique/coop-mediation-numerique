'use client'

import {
  DataTable,
  type DataTableSelection,
  type DataTableUrlState,
} from '@app/web/libraries/data-table'
import { BeneficiairesTableHead } from './BeneficiairesTableHead'
import { BeneficiaireTableRow } from './BeneficiaireTableRow'
import type { BeneficiaireRow } from './beneficiaire-row'

export const BeneficiairesTable = ({
  rows,
  state,
  baseHref,
  selection,
}: {
  rows: readonly BeneficiaireRow[]
  state: DataTableUrlState
  baseHref: string
  selection: DataTableSelection
}) => (
  <DataTable className="fr-mb-8v">
    <BeneficiairesTableHead
      state={state}
      baseHref={baseHref}
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
