import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import ActeursPage from '@app/web/features/mon-reseau/use-cases/acteurs/ActeursPage'
import { getActeursFiltersOptions } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeursFiltersOptions'
import { getActeursPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeursPageData'
import {
  type ActeursSearchParams,
  validateActeursFilters,
} from '@app/web/features/mon-reseau/use-cases/acteurs/validation/ActeursFilters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Annuaire des acteurs'),
}

const Page = async ({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ departement: string }>
  searchParams: Promise<ActeursSearchParams>
}) => {
  await authenticateMediateurOrCoordinateur()

  const { departement: departementCode } = await params
  const departement = getDepartementFromCodeOrThrowNotFound(departementCode)

  const unvalidatedSearchParams = await rawSearchParams
  const searchParams = validateActeursFilters(unvalidatedSearchParams)

  const [pageData, filtersOptions] = await Promise.all([
    getActeursPageData({
      departementCode,
      searchParams,
    }),
    getActeursFiltersOptions({
      departementCode,
      currentLieuxFilter: searchParams.lieux,
    }),
  ])

  // Build current path with all search params for return URLs
  const currentPathBase = `/coop/mon-reseau/${departementCode}/acteurs`
  const currentPathParams = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value != null) {
      currentPathParams.set(key, String(value))
    }
  }

  const currentPath =
    currentPathParams.size > 0
      ? `${currentPathBase}?${currentPathParams.toString()}`
      : currentPathBase

  return (
    <ActeursPage
      departement={departement}
      searchResult={pageData.searchResult}
      searchParams={searchParams}
      isFiltered={pageData.isFiltered}
      communesOptions={filtersOptions.communesOptions}
      departementsOptions={filtersOptions.departementsOptions}
      lieuxActiviteOptions={filtersOptions.lieuxActiviteOptions}
      currentPath={currentPath}
    />
  )
}

export default Page
