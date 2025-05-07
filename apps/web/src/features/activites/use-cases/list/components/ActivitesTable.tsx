import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { SearchActiviteResult } from '../db/searchActivite'
import ActiviteRowShowDetailsButton from './ActiviteRowShowDetailsButton'
import {
  ActivitesDataTable,
  ActivitesDataTableSearchParams,
} from './ActivitesDataTable'
import styles from './MesActivitesListePage.module.css'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const ActivitesTable = ({
  data: { activites, totalPages },
  searchParams,
  baseHref,
}: {
  data: SearchActiviteResult
  searchParams: ActivitesDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={activites}
      configuration={ActivitesDataTable}
      searchParams={searchParams}
      baseHref={baseHref}
      classes={{ table: styles.table }}
      rowButtonComponent={ActiviteRowShowDetailsButton}
    />
    <PaginationNavWithPageSizeSelect
      defaultPageSize={10}
      pageSizeOptions={pageSizeOptions}
      totalPages={totalPages}
      searchParams={searchParams}
      baseHref={baseHref}
    />
  </>
)

export default ActivitesTable
