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
import { getDepartementsFromCodesInsee } from '@app/web/utils/getDepartementFromCodeInsee'
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

  // Build departementsOptions from communes
  const departementsOptions = getDepartementsFromCodesInsee(
    filtersOptions.communesOptions.map(({ value }) => value),
  ).map(({ code, nom }) => ({
    value: code,
    label: `${code} · ${nom}`,
  }))

  return (
    <LieuxPage
      departement={departement}
      searchResult={pageData.searchResult}
      searchParams={searchParams}
      isFiltered={pageData.isFiltered}
      communesOptions={filtersOptions.communesOptions}
      departementsOptions={departementsOptions}
      mediateursOptions={filtersOptions.mediateursOptions}
    />
  )
}

export default Page
