import {
  type DataTableUrlState,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'

const LIGNES_PAR_DEFAUT = 100

const lignesProposees = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

export const UtilisateursPagination = ({
  state,
  baseHref,
  nombreDUtilisateurs,
  lignesParPage,
}: {
  state: DataTableUrlState
  baseHref: string
  nombreDUtilisateurs: number
  lignesParPage: number
}) => (
  <PaginationNavWithPageSizeSelect
    defaultPageSize={LIGNES_PAR_DEFAUT}
    pageSizeOptions={lignesProposees}
    itemsCount={nombreDUtilisateurs}
    pageSize={lignesParPage}
    baseHref={baseHref}
    state={state}
  />
)
