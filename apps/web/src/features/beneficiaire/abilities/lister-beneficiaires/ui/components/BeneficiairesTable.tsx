'use client'

import {
  type DataTableSelection,
  DataTableShell,
  type DataTableUrlState,
} from '@app/web/libraries/data-table'
import styles from './BeneficiairesTable.module.css'
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
  <DataTableShell
    className="fr-table--nowrap fr-width-full fr-mb-8v"
    tableClassName={styles.table}
  >
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
  </DataTableShell>
)
