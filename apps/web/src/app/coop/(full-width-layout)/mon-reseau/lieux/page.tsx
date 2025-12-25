import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { departementsByCode } from '@app/web/data/collectivites-territoriales/departements'
import { getLieuxFiltersOptions } from '@app/web/features/mon-reseau/use-cases/lieux/getLieuxFiltersOptions'
import { getLieuxPageData } from '@app/web/features/mon-reseau/use-cases/lieux/getLieuxPageData'
import LieuxPage from '@app/web/features/mon-reseau/use-cases/lieux/LieuxPage'
import {
  type LieuxSearchParams,
  validateLieuxFilters,
} from '@app/web/features/mon-reseau/use-cases/lieux/validation/LieuxFilters'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { getDepartementsFromCodesInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle("Annuaire des lieux d'activités"),
}

const DEFAULT_DEPARTEMENT_CODE = '75'

const Page = async ({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<LieuxSearchParams>
}) => {
  const user = await authenticateMediateurOrCoordinateur()

  const unvalidatedSearchParams = await rawSearchParams

  // Get department from URL param or user's department
  let departementCode = unvalidatedSearchParams.departement
  if (!departementCode) {
    const userDepartement = getUserDepartement(user)
    departementCode = userDepartement?.code ?? DEFAULT_DEPARTEMENT_CODE
    redirect(`/coop/mon-reseau/lieux?departement=${departementCode}`)
  }

  if (!departementsByCode.has(departementCode)) {
    return notFound()
  }

  const searchParams = validateLieuxFilters(unvalidatedSearchParams)

  const [pageData, filtersOptions] = await Promise.all([
    getLieuxPageData({
      departementCode,
      searchParams: { ...searchParams, departement: departementCode },
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
      departement={pageData.departement}
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
