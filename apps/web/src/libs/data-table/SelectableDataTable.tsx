'use client'

import type { ComponentType, ReactNode } from 'react'
import { useMemo } from 'react'
import DataTable, { type DataTableClasses } from './DataTable'
import styles from './DataTable.module.css'
import type {
  DataTableConfiguration,
  DataTableRow,
  DataTableSearchParams,
} from './DataTableConfiguration'

export type SelectableDataTableProps<
  Data extends DataTableRow,
  Configuration extends
    DataTableConfiguration<Data> = DataTableConfiguration<Data>,
> = {
  rows: Data[]
  configuration: Configuration
  className?: string
  classes?: DataTableClasses
  searchParams: DataTableSearchParams<Configuration>
  baseHref: string
  rowButtonComponent?: ComponentType<{ row: Data }>
  selectedIds: Set<string>
  onSelectionChange: (selectedIds: Set<string>) => void
  getRowLabel?: (row: Data) => string
}

const SelectableDataTable = <
  Data extends DataTableRow,
  Configuration extends DataTableConfiguration<Data>,
>({
  rows,
  configuration,
  selectedIds,
  onSelectionChange,
  getRowLabel,
  ...dataTableProps
}: SelectableDataTableProps<Data, Configuration>) => {
  const allSelected = useMemo(
    () =>
      rows.length > 0 &&
      rows.every((row) => selectedIds.has(configuration.rowKey(row))),
    [rows, selectedIds, configuration],
  )

  const someSelected = useMemo(
    () => rows.some((row) => selectedIds.has(configuration.rowKey(row))),
    [rows, selectedIds, configuration],
  )

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(rows.map((row) => configuration.rowKey(row))))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    onSelectionChange(newSelected)
  }

  const headerPrefix = (
    <th
      scope="col"
      className="fr-checkbox-group fr-checkbox-group--sm fr-pb-6v"
      style={{ width: 20 }}
    >
      <input
        type="checkbox"
        id="select-all-rows"
        checked={allSelected}
        onChange={toggleSelectAll}
        ref={(el) => {
          if (el) {
            el.indeterminate = someSelected && !allSelected
          }
        }}
      />
      <label className="fr-label" htmlFor="select-all-rows">
        <span className="fr-sr-only">Tout sélectionner</span>
      </label>
    </th>
  )

  const rowPrefix = (row: Data) => {
    const id = configuration.rowKey(row)
    const isSelected = selectedIds.has(id)
    const checkboxId = `select-row-${id}`
    const label = getRowLabel?.(row) ?? ''

    return (
      <td
        className={`fr-checkbox-group fr-checkbox-group--sm fr-pb-8v ${styles.prefixCell}`}
        style={{ width: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          id={checkboxId}
          checked={isSelected}
          onChange={() => toggleSelect(id)}
        />
        <label className="fr-label" htmlFor={checkboxId}>
          <span className="fr-sr-only">Sélectionner {label}</span>
        </label>
      </td>
    )
  }

  return (
    <DataTable
      {...dataTableProps}
      rows={rows}
      configuration={configuration}
      headerPrefix={headerPrefix}
      rowPrefix={rowPrefix}
    />
  )
}

export default SelectableDataTable
