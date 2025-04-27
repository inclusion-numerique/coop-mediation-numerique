import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { type SearchUtilisateurResult } from '../search/searchUtilisateur'
import {
  UtilisateursDataTable,
  type UtilisateursDataTableSearchParams,
} from './UtilisateursDataTable'
import styles from './UtilisateursTable.module.css'

const defaultPageSize = 100

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

const UtilisateursTable = ({
  data: { utilisateurs, totalPages },
  searchParams,
  baseHref,
}: {
  data: SearchUtilisateurResult
  searchParams: UtilisateursDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={utilisateurs}
      configuration={UtilisateursDataTable}
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

export default UtilisateursTable
