import type { SortDirection } from '@arckit/resultset'
import { type DataTableUrlState } from '@/libraries/data-table'
import { DEFAULT_PAGE } from '@/libraries/data-table/pagination/page-size-options'
import { entierPositifLu } from '@/libraries/parametres-d-url'
import type { ListerEmployeuses } from '../domain/lister-employeuses'

export const PAR_PAGE_PAR_DEFAUT = 100

export type EmployeusesSearchParams = {
  recherche?: string
  tri?: string
  ordre?: string
  page?: string
  lignes?: string
}

type CriteresListeEmployeuses = Parameters<ListerEmployeuses>[0]

const sensLu = (ordre?: string): SortDirection | undefined =>
  ordre === 'asc' || ordre === 'desc' ? ordre : undefined

export const criteresListeEmployeuses = (
  params: EmployeusesSearchParams,
): CriteresListeEmployeuses => ({
  recherche: params.recherche ?? '',
  page: entierPositifLu(params.page, DEFAULT_PAGE),
  parPage: entierPositifLu(params.lignes, PAR_PAGE_PAR_DEFAUT),
  triPar: params.tri ?? null,
  sens: sensLu(params.ordre) ?? null,
})

export const etatDeTableEmployeuses = (
  params: EmployeusesSearchParams,
): DataTableUrlState => ({
  recherche: params.recherche,
  tri: params.tri,
  ordre: sensLu(params.ordre),
  page: params.page,
  lignes: params.lignes,
})
