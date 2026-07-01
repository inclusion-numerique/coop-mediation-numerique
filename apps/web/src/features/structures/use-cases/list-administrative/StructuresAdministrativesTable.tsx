import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import styles from '../list/StructuresTable.module.css'
import {
  StructuresAdministrativesDataTable,
  type StructuresAdministrativesDataTableSearchParams,
} from './StructuresAdministrativesDataTable'
import { type SearchStructuresAdministrativesResult } from './searchStructuresAdministratives'

const defaultPageSize = 100

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

const StructuresAdministrativesTable = ({
  data: { structures, totalPages },
  searchParams,
  baseHref,
}: {
  data: SearchStructuresAdministrativesResult
  searchParams: StructuresAdministrativesDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={structures}
      configuration={StructuresAdministrativesDataTable}
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

export default StructuresAdministrativesTable
