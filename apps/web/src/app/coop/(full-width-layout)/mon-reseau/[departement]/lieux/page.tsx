import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import { getLieuxFiltersOptions } from '@app/web/features/mon-reseau/use-cases/lieux/getLieuxFiltersOptions'
import { getLieuxPageData } from '@app/web/features/mon-reseau/use-cases/lieux/getLieuxPageData'
import LieuxPage from '@app/web/features/mon-reseau/use-cases/lieux/LieuxPage'
import {
  type LieuxSearchParams,
  validateLieuxFilters,
} from '@app/web/features/mon-reseau/use-cases/lieux/validation/LieuxFilters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle("Annuaire des lieux d'activités"),
}

const Page = async ({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ departement: string }>
  searchParams: Promise<LieuxSearchParams>
}) => {
  await authenticateMediateurOrCoordinateur()

  const { departement: departementCode } = await params
  const departement = getDepartementFromCodeOrThrowNotFound(departementCode)

  const unvalidatedSearchParams = await rawSearchParams
  const searchParams = validateLieuxFilters(unvalidatedSearchParams)

  const [pageData, filtersOptions] = await Promise.all([
    getLieuxPageData({
      departementCode,
      searchParams,
    }),
    getLieuxFiltersOptions({ departementCode }),
  ])

  return (
    <LieuxPage
      departement={departement}
      searchResult={pageData.searchResult}
      searchParams={searchParams}
      isFiltered={pageData.isFiltered}
      communesOptions={filtersOptions.communesOptions}
    />
  )
}

export default Page
