import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { SearchActiviteResult } from '../db/searchActivite'
import ActiviteRowShowDetailsButton from './ActiviteRowShowDetailsButton'
import {
  ActivitesDataTable,
  ActivitesDataTableSearchParams,
} from './ActivitesDataTable'
import styles from './MesActivitesListePage.module.css'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const ActivitesTable = ({
  data: { activites, totalPages, timezone },
  searchParams,
  baseHref,
}: {
  data: SearchActiviteResult & { timezone: string }
  searchParams: ActivitesDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={activites.map((activite) => ({
        ...activite,
        timezone,
      }))}
      configuration={ActivitesDataTable}
      searchParams={searchParams}
      baseHref={baseHref}
      classes={{ table: styles.table }}
      rowButtonComponent={ActiviteRowShowDetailsButton}
    />
    <PaginationNavWithPageSizeSelect
      defaultPageSize={DEFAULT_PAGE_SIZE}
      pageSizeOptions={pageSizeOptions}
      totalPages={totalPages}
      searchParams={searchParams}
      baseHref={baseHref}
    />
  </>
)

export default ActivitesTable
