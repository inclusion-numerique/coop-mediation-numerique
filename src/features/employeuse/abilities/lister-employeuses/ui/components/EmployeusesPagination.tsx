import {
  type DataTableUrlState,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import { PAR_PAGE_PAR_DEFAUT } from '../search-params/lister-employeuses.search-params'

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

export const EmployeusesPagination = ({
  state,
  baseHref,
  trouvees,
  parPage,
}: {
  state: DataTableUrlState
  baseHref: string
  trouvees: number
  parPage: number
}) => (
  <PaginationNavWithPageSizeSelect
    defaultPageSize={PAR_PAGE_PAR_DEFAUT}
    pageSizeOptions={pageSizeOptions}
    itemsCount={trouvees}
    pageSize={parPage}
    baseHref={baseHref}
    state={state}
  />
)
