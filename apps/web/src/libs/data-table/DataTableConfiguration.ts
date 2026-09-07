import type { SelectInputOption } from '@app/ui/components/Form/utils/options'
import type { Sql } from '@prisma/client/runtime/library'
import type { CSSProperties, ReactNode } from 'react'
import type { SortDirection } from './SortLink'

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
  header?: ReactNode
  cellAsTh?: boolean
  cellClassName?: string
  cellStyle?: CSSProperties
  headerClassName?: string
  csvHeaders?: string[]
  csvValues?: (row: DataRow) => (string | number | null | undefined)[]
  defaultSortable?: boolean
  defaultSortableDirection?: SortDirection
  sortInMemory?: (a: DataRow, b: DataRow) => number
  sortable?: boolean
  orderBy?: (direction: SortDirection) => OrderBy[]
  rawOrderBy?: (direction: SortDirection) => Sql[]
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
  rowLink?: (row: DataRow) =>
    | {
        href: string
        replace?: boolean
        scroll?: boolean
        shallow?: boolean
        prefetch?: boolean
      }
    | undefined
  rowInMemorySearchableString?: (row: DataRow) => string
  defaultSortableInMemory?: (a: DataRow, b: DataRow) => number
}

/**
 * Les colonnes qui portent des filtres.
 *
 * Le même défaut que `tri` ci-dessous : `filters` est facultatif, `Extract` ne
 * retient pas une propriété facultative, et ce type vaut donc `never` — les
 * deux types de filtres qui en dérivent sont des objets vides, si bien que les
 * paramètres de filtre ne sont vérifiés nulle part.
 *
 * La correction s'écrit en deux lignes :
 *
 *     NonNullable<Configuration['columns'][number]['filters']>[number]['name']
 *
 * mais elle fait apparaître deux incohérences réelles, dans `activites` et
 * `utilisateurs`, où des filtres d'activités sont passés là où une autre table
 * attend les siens. À reprendre quand ces features passeront à la refacto,
 * pas au détour d'un correctif sur le tri.
 */
type ConfiguredFilters<Configuration extends DataTableConfiguration> = Extract<
  Configuration['columns'][number],
  { filters: Required<DataTableColumn['filters']> }
>

export type DataTableFilterValues<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
> = {
  [key in Exclude<
    ConfiguredFilters<Configuration>['filters'],
    undefined
  >[number]['name']]: string[] | undefined
}

export type DataTableFilterSearchParams<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
> = {
  [key in Exclude<
    ConfiguredFilters<Configuration>['filters'],
    undefined
  >[number]['name']]: string | undefined
}

export type DataTableSearchParams<
  Configuration extends DataTableConfiguration = DataTableConfiguration,
  FilterParams extends Record<string, unknown> = Record<string, unknown>,
> = {
  recherche?: string
  /**
   * La colonne sur laquelle trier : l'une de celles que la table déclare.
   *
   * On aimerait n'admettre ici que les colonnes triables. Ce n'est pas
   * exprimable : `sortable` et ses voisins sont facultatifs, et `Extract` ne
   * retient jamais une propriété facultative. L'ancienne écriture —
   * `Extract<colonnes, { sortable: … }>['name']` — valait donc `never`, ce qui
   * rendait `tri` inutilisable dans du code typé alors que l'URL le porte bien
   * et que le tri fonctionnait à l'exécution.
   *
   * Ce qui empêche d'offrir un tri que personne ne sait résoudre est ailleurs :
   * le référentiel passé à `getDataTableOrderBy`, qui doit couvrir exactement
   * les colonnes que l'écran déclare triables.
   */
  tri?: Configuration['columns'][number]['name']
  ordre?: SortDirection
  page?: string // String as it is used in URL query params
  lignes?: string // Nombre de résultats par page // String as it is used in URL query params
} & DataTableFilterSearchParams<Configuration> &
  FilterParams
