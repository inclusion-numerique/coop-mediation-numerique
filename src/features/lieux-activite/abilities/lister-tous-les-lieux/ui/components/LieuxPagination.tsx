import {
  type DataTableUrlState,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import { TAILLE_DE_PAGE_PAR_DEFAUT } from '../presenters/lister-tous-les-lieux-search-params'

const pageSizeOptions = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

export const LieuxPagination = ({
  state,
  baseHref,
  itemsCount,
  pageSize,
}: {
  state: DataTableUrlState
  baseHref: string
  itemsCount: number
  pageSize: number
}) => (
  <PaginationNavWithPageSizeSelect
    defaultPageSize={TAILLE_DE_PAGE_PAR_DEFAUT}
    pageSizeOptions={pageSizeOptions}
    itemsCount={itemsCount}
    pageSize={pageSize}
    baseHref={baseHref}
    state={state}
  />
)
