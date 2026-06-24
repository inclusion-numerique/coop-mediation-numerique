import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { DataTableUrlState } from '../data-table-url-state'
import { createDataTableHref } from '../href/create-data-table-href'

/**
 * Callback de recherche : pousse une nouvelle URL avec la requête saisie, en
 * réinitialisant la page (une nouvelle recherche repart de la page 1).
 */
export const createSearchCallback =
  ({
    router,
    state,
    baseHref,
  }: {
    router: AppRouterInstance
    state: DataTableUrlState
    baseHref: string
  }) =>
  (searchQuery: string) => {
    const { page: _page, recherche: _recherche, ...rest } = state

    router.push(
      createDataTableHref(
        baseHref,
        searchQuery.trim() ? { ...rest, recherche: searchQuery.trim() } : rest,
      ),
    )
  }
