import {
  DEFAULT_PAGE_SIZE,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import { LIGNES_PAR_PAGE } from '../../domain'
import { etatDeLaTable } from '../search-params/etat-de-la-table.search-params'

const optionsDeLignes = generatePageSizeSelectOptions([...LIGNES_PAR_PAGE])

export const PaginationDesActivites = ({
  adresse,
  parametres,
  total,
  lignesParPage,
  className,
}: {
  adresse: string
  parametres: Readonly<Record<string, string>>
  total: number
  lignesParPage: number
  className?: string
}) => (
  <PaginationNavWithPageSizeSelect
    className={className}
    baseHref={adresse}
    state={etatDeLaTable(parametres)}
    itemsCount={total}
    pageSize={lignesParPage}
    defaultPageSize={DEFAULT_PAGE_SIZE}
    pageSizeOptions={optionsDeLignes}
  />
)
