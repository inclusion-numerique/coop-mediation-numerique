import {
  type BeneficiaireSortField,
  beneficiaireSortFields,
} from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import type { DataTableUrlState } from '@app/web/libraries/data-table'
import { Page, PageSize, Search, Sort, SortDirection } from '@arckit/resultset'

export const DEFAULT_PAGE_SIZE = 20

/**
 * Paramètres d'URL de la liste des bénéficiaires. Les noms de colonne `tri`
 * sont alignés sur les `BeneficiaireSortField` du domaine (pas de table de
 * correspondance à maintenir).
 */
export type MesBeneficiairesSearchParams = {
  recherche?: string
  tri?: string
  ordre?: string
  page?: string
  lignes?: string
}

export type ListerBeneficiairesQuery = {
  search?: Search
  sort?: Sort<BeneficiaireSortField>
  page: Page
  pageSize: PageSize
}

const isSortField = (value: string): value is BeneficiaireSortField =>
  (beneficiaireSortFields as readonly string[]).includes(value)

const toSearch = (recherche?: string): Search | undefined =>
  recherche?.trim() ? Search(recherche.trim()) : undefined

const toSort = (
  tri?: string,
  ordre?: string,
): Sort<BeneficiaireSortField> | undefined =>
  tri && isSortField(tri)
    ? Sort(tri, SortDirection(ordre === 'desc' ? 'desc' : 'asc'))
    : undefined

const toPositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const toListerBeneficiairesQuery = (
  params: MesBeneficiairesSearchParams,
): ListerBeneficiairesQuery => ({
  search: toSearch(params.recherche),
  sort: toSort(params.tri, params.ordre),
  page: Page(toPositiveInteger(params.page, 1)),
  pageSize: PageSize(toPositiveInteger(params.lignes, DEFAULT_PAGE_SIZE)),
})

/**
 * Projette les paramètres d'URL bruts vers l'état générique consommé par les
 * composants `libraries/data-table` (coercition de `ordre` en `SortDirection`).
 */
export const toDataTableUrlState = (
  params: MesBeneficiairesSearchParams,
): DataTableUrlState => ({
  recherche: params.recherche,
  tri: params.tri,
  ordre:
    params.ordre === 'desc'
      ? 'desc'
      : params.ordre === 'asc'
        ? 'asc'
        : undefined,
  page: params.page,
  lignes: params.lignes,
})
