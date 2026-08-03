import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import type { EmployeuseAffichee } from './employeuse-affichee.presenter'
import {
  EmployeusesDataTable,
  type EmployeusesSearchParams,
} from './employeuses.data-table'

const defaultPageSize = 100

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

const EmployeusesTable = ({
  employeuses,
  pages,
  searchParams,
  baseHref,
}: {
  employeuses: EmployeuseAffichee[]
  pages: number
  searchParams: EmployeusesSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={employeuses}
      configuration={EmployeusesDataTable}
      searchParams={searchParams}
      baseHref={baseHref}
      classes={{ table: 'fr-table--transparent' }}
    />
    <PaginationNavWithPageSizeSelect
      defaultPageSize={defaultPageSize}
      pageSizeOptions={pageSizeOptions}
      totalPages={pages}
      baseHref={baseHref}
      searchParams={searchParams}
    />
  </>
)

export default EmployeusesTable
