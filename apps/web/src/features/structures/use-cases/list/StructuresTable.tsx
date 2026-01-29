import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { type SearchStructuresResult } from '../search/searchStructures'
import {
  StructuresDataTable,
  type StructuresDataTableSearchParams,
} from './StructuresDataTable'
import styles from './StructuresTable.module.css'

const defaultPageSize = 100

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

const StructuresTable = ({
  data: { structures, totalPages },
  searchParams,
  baseHref,
}: {
  data: SearchStructuresResult
  searchParams: StructuresDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={structures}
      configuration={StructuresDataTable}
      searchParams={searchParams}
      baseHref={baseHref}
      classes={{ table: styles.table }}
    />
    <PaginationNavWithPageSizeSelect
      defaultPageSize={defaultPageSize}
      pageSizeOptions={pageSizeOptions}
      totalPages={totalPages}
      baseHref={baseHref}
      searchParams={searchParams}
    />
  </>
)

export default StructuresTable
