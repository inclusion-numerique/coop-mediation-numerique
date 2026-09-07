import {
  DataTableConfiguration,
  DataTableRow,
  DataTableSearchParams,
} from './DataTableConfiguration'
import type { SortDirection } from './SortLink'

/**
 * Le tri d'une colonne, dit en langage de requête.
 *
 * Une colonne peut le porter elle-même — c'est la forme historique, et elle
 * oblige l'écran à écrire du fragment de requête. Un référentiel passé à côté
 * dit la même chose depuis l'implémentation : l'écran n'a plus qu'à nommer les
 * colonnes qu'il rend triables, et c'est celui qui interroge la base qui sait
 * comment les trier.
 */
export type SortReferential<
  ColumnName extends string,
  OrderBy extends Record<string, unknown>,
> = Readonly<Record<ColumnName, (direction: SortDirection) => OrderBy[]>>

export const getDataTableOrderBy = <
  OrderBy extends Record<string, unknown> = Record<string, unknown>,
  Configuration extends DataTableConfiguration<
    DataTableRow,
    Record<string, unknown>,
    OrderBy
  > = DataTableConfiguration<DataTableRow, Record<string, unknown>, OrderBy>,
>(
  searchParams: DataTableSearchParams<Configuration>,
  configuration: Configuration,
  referential?: SortReferential<string, OrderBy>,
): OrderBy[] => {
  const direction = searchParams.ordre ?? 'asc'
  const triDe = (column: Configuration['columns'][number]) =>
    referential?.[column.name] ?? column.orderBy

  // Applying default order by
  if (!searchParams.tri) {
    const defaultColumn = configuration.columns.find(
      (column) => column.defaultSortable && triDe(column),
    )
    const defaultOrderBy = defaultColumn && triDe(defaultColumn)
    if (!defaultColumn || !defaultOrderBy) {
      return []
    }

    return defaultOrderBy(defaultColumn.defaultSortableDirection ?? direction)
  }
  const column = configuration.columns.find(
    (item) => item.name === searchParams.tri,
  )
  const orderBy = column && triDe(column)

  return orderBy ? orderBy(direction) : []
}

export const getDataTableRawOrderBy = <
  OrderBy extends Record<string, unknown> = Record<string, unknown>,
  Configuration extends DataTableConfiguration<
    DataTableRow,
    Record<string, unknown>,
    OrderBy
  > = DataTableConfiguration<DataTableRow, Record<string, unknown>, OrderBy>,
>(
  searchParams: DataTableSearchParams<Configuration>,
  configuration: Configuration,
): OrderBy[] => {
  const direction = searchParams.ordre ?? 'asc'

  // Applying default order by
  if (!searchParams.tri) {
    const defaultOrderByColumn = configuration.columns.find(
      (column) => column.defaultSortable && column.orderBy,
    )?.orderBy
    if (!defaultOrderByColumn) {
      return []
    }

    return defaultOrderByColumn(direction)
  }
  const column = configuration.columns.find(
    (item) => item.name === searchParams.tri,
  )

  return column?.orderBy ? column.orderBy(direction) : []
}
