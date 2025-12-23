import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { departementsByCode } from '@app/web/data/collectivites-territoriales/departements'
import ActeursPage from '@app/web/features/mon-reseau/use-cases/acteurs/ActeursPage'
import { getActeursFiltersOptions } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeursFiltersOptions'
import { getActeursPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeursPageData'
import {
  type ActeursSearchParams,
  validateActeursFilters,
} from '@app/web/features/mon-reseau/use-cases/acteurs/validation/ActeursFilters'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Annuaire des acteurs'),
}

const DEFAULT_DEPARTEMENT_CODE = '75'

const Page = async ({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<ActeursSearchParams>
}) => {
  const user = await authenticateMediateurOrCoordinateur()

  const unvalidatedSearchParams = await rawSearchParams

  // Get department from URL param or user's department
  let departementCode = unvalidatedSearchParams.departement
  if (!departementCode) {
    const userDepartement = getUserDepartement(user)
    departementCode = userDepartement?.code ?? DEFAULT_DEPARTEMENT_CODE
    redirect(`/coop/mon-reseau/acteurs?departement=${departementCode}`)
  }

  if (!departementsByCode.has(departementCode)) {
    return notFound()
  }

  const searchParams = validateActeursFilters(unvalidatedSearchParams)

  const [pageData, filtersOptions] = await Promise.all([
    getActeursPageData({
      departementCode,
      searchParams: { ...searchParams, departement: departementCode },
    }),
    getActeursFiltersOptions({ departementCode }),
  ])

  // Build current path with all search params for return URLs
  const currentPathBase = '/coop/mon-reseau/acteurs'
  const currentPathParams = new URLSearchParams()
  currentPathParams.set('departement', departementCode)
  for (const [key, value] of Object.entries(searchParams)) {
    if (value != null) {
      currentPathParams.set(key, String(value))
    }
  }

  const currentPath = `${currentPathBase}?${currentPathParams.toString()}`

  return (
    <ActeursPage
      departement={pageData.departement}
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
