import type { Page, PageSize, Paginated, Search, Sort } from '@arckit/resultset'
import type {
  ColonneDesEmployeuses,
  EmployeuseListee,
} from './employeuse-listee'

export type ListerEmployeuses = (criteres: {
  readonly recherche: Search
  readonly tri: Sort<ColonneDesEmployeuses>
  readonly page: Page
  readonly pageSize: PageSize
}) => Promise<Paginated<EmployeuseListee>>
