import type { ReactNode } from 'react'
import type { SelectInputOption } from '@app/ui/components/Form/utils/options'
import type { SortDirection } from '@app/web/data-table/SortLink'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableRow = any

export type DataTableFilter<
  DataRow extends DataTableRow = DataTableRow,
  Where extends Record<string, unknown> = Record<string, unknown>,
  FilterName extends string = string,
  V extends string = string,
> = {
  name: FilterName
  title: ReactNode
  options?:
    | SelectInputOption[]
    | (() => SelectInputOption[])
    | (() => Promise<SelectInputOption[]>)
  toQuery?: (value: V[]) => string
  fromQuery?: (query?: string) => V[]
  applyInMemory?: (row: DataRow, value: V[]) => boolean
  applyWhereCondition?: (query: string, value: V[]) => Where
  render?: (value: V[]) => ReactNode | Promise<ReactNode>
}

export type DataTableColumn<
  DataRow extends DataTableRow = DataTableRow,
  Where extends Record<string, unknown> = Record<string, unknown>,
  OrderBy extends Record<string, unknown> = Record<string, unknown>,
  ColumnName extends string = string,
> = {
  name: ColumnName
  header: ReactNode
  cellAsTh?: boolean
  cellClassName?: string
  headerClassName?: string
  csvHeaders?: string[]
  csvValues?: (row: DataRow) => (string | number | null | undefined)[]
  defaultSortable?: boolean
  sortable?: (a: DataRow, b: DataRow) => number
  orderBy?: (direction: SortDirection) => OrderBy[]
  cell?: (row: DataRow) => ReactNode
  filters?: DataTableFilter<DataRow, Where>[]
}

export type DataTableConfiguration<
  DataRow extends DataTableRow = DataTableRow,
  Where extends Record<string, unknown> = Record<string, unknown>,
  OrderBy extends Record<string, unknown> = Record<string, unknown>,
> = {
  csvFilename?: string | (() => string)
  columns: DataTableColumn<DataRow, Where, OrderBy>[]
  rowKey: (row: DataRow) => string
  rowLink?: (row: DataRow) => {
    href: string
    replace?: boolean
    scroll?: boolean
    shallow?: boolean
    prefetch?: boolean
  }
  rowInMemorySearchableString?: (row: DataRow) => string
  defaultSortableInMemory?: (a: DataRow, b: DataRow) => number
}

type ConfiguredFilters<Configuration extends DataTableConfiguration> = Extract<
  Configuration['columns'][number],
  { filters: Required<DataTableColumn['filters']> }
>

export type DataTableFilterValues<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
> = {
  // TODO type for key in filter names and T values from config
  [key in Exclude<
    ConfiguredFilters<Configuration>['filters'],
    undefined
  >[number]['name']]: string[] | undefined
}

export type DataTableFilterSearchParams<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
> = {
  // TODO type for key in filter names and T values from config
  [key in Exclude<
    ConfiguredFilters<Configuration>['filters'],
    undefined
  >[number]['name']]: string | undefined
}

type SortableColumn<Configuration extends DataTableConfiguration> = Extract<
  Configuration['columns'][number],
  { sortable: Required<DataTableColumn['sortable']> }
>

export type DataTableSearchParams<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
> = {
  recherche?: string
  tri?: SortableColumn<Configuration>['name']
  ordre?: SortDirection
  page?: number
  lignes?: number // Nombre de résultats par page
} & DataTableFilterSearchParams<Configuration>
