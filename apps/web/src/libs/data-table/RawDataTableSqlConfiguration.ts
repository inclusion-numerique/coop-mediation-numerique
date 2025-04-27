import type { Sql } from '@prisma/client/runtime/library'
import type {
  DataTableConfiguration,
  DataTableFilter,
} from './DataTableConfiguration'
import type { SortDirection } from './SortLink'

type ExtractFilters<Column> = Column extends { filters: infer F }
  ? F extends DataTableFilter[]
    ? F[number]['name']
    : never
  : never

export type RawDataTableSqlConfiguration<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
> = {
  [K in Configuration['columns'][number] as K['name']]?: {
    rawOrderBySql?: (direction: SortDirection) => Sql
    rawFilterSqls?: {
      [F in ExtractFilters<K>]?: (value: string[]) => Sql
    }
  }
}
