import {
  type DataTableUrlState,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@app/web/libraries/data-table'
import { DEFAULT_PAGE_SIZE } from './lister-beneficiaires-search-params'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export const BeneficiairesPagination = ({
  state,
  baseHref,
  totalPages,
}: {
  state: DataTableUrlState
  baseHref: string
  totalPages: number
}) => (
  <PaginationNavWithPageSizeSelect
    defaultPageSize={DEFAULT_PAGE_SIZE}
    pageSizeOptions={pageSizeOptions}
    totalPages={totalPages}
    baseHref={baseHref}
    state={state}
  />
)
