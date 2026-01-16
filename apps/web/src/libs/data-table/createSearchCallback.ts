import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const createSearchCallback =
  <T extends { recherche?: string; page?: string }>({
    router,
    searchParams,
    baseHref,
  }: {
    router: AppRouterInstance
    searchParams: T
    baseHref: string
  }) =>
  (searchQuery: string) => {
    const queryParams: T = {
      ...searchParams,
    }

    // Reset page when search changes
    delete queryParams.page

    if (searchQuery.trim()) {
      queryParams.recherche = searchQuery
    } else {
      delete queryParams.recherche
    }

    const href = `${baseHref}?${new URLSearchParams(queryParams).toString()}`

    router.push(href)
  }
