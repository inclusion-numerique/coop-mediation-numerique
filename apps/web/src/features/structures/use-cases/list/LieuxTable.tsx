import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { type SearchLieuxResult } from '../search/searchLieux'
import {
  LieuxDataTable,
  type LieuxDataTableSearchParams,
} from './LieuxDataTable'

const defaultPageSize = 100

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

const LieuxTable = ({
  data: { structures, totalPages },
  searchParams,
  baseHref,
}: {
  data: SearchLieuxResult
  searchParams: LieuxDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={structures}
      configuration={LieuxDataTable}
      searchParams={searchParams}
      baseHref={baseHref}
      classes={{ table: 'fr-table--transparent' }}
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

export default LieuxTable
