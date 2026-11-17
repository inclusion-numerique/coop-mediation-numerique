import type { LigneUtilisateur } from '@app/web/features/utilisateurs/domain'
import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import {
  UtilisateursDataTable,
  type UtilisateursDataTableSearchParams,
} from './UtilisateursDataTable'

const LIGNES_PAR_DEFAUT = 100

const lignesProposees = generatePageSizeSelectOptions([
  10, 20, 50, 100, 250, 500, 1000,
])

export const UtilisateursTable = ({
  utilisateurs,
  totalPages,
  searchParams,
  baseHref,
}: {
  utilisateurs: readonly LigneUtilisateur[]
  totalPages: number
  searchParams: UtilisateursDataTableSearchParams
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      rows={[...utilisateurs]}
      configuration={UtilisateursDataTable}
      searchParams={searchParams}
      baseHref={baseHref}
      classes={{ table: 'fr-table--transparent' }}
    />
    <PaginationNavWithPageSizeSelect
      defaultPageSize={LIGNES_PAR_DEFAUT}
      pageSizeOptions={lignesProposees}
      totalPages={totalPages}
      baseHref={baseHref}
      searchParams={searchParams}
    />
  </>
)
