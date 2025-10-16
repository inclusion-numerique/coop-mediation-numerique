import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import type { ActivitesDataTableSearchParams } from '@app/web/features/activites/use-cases/list/components/ActivitesDataTable'
import MesActivitesListeHeader from '@app/web/features/activites/use-cases/list/components/MesActivitesListeHeader'
import MesActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/MesActivitesListeLayout'
import { getWidestActiviteDatesRange } from '@app/web/features/activites/use-cases/list/db/getWidestActiviteDatesRange'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import MesActivitesListePage from '@app/web/features/activites/use-cases/list/MesActivitesListePage'
import { validateActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { hasFeatureFlag } from '@app/web/security/hasFeatureFlag'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités'),
}

const MesActivitesPage = async ({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<ActivitesDataTableSearchParams>
}) => {
  const user = await authenticateMediateur()

  const searchParams = validateActivitesFilters(await rawSearchParams)
  const data = getActivitesListPageData({
    mediateurId: user.mediateur.id,
    searchParams,
    user,
  })

  const searchResultMatchesCount = data.then(
    ({ searchResult: { accompagnementsMatchesCount } }) =>
      accompagnementsMatchesCount,
  )

  const {
    communesOptions,
    departementsOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    tagsOptions,
    activiteDates, // TODO include rdv dates
    rdvDates,
    activiteSourceOptions,
    hasCrasV1,
  } = await getFiltersOptionsForMediateur({
    user,
    includeBeneficiaireIds: searchParams.beneficiaires,
  })

  const datesForFilters = getWidestActiviteDatesRange(activiteDates, rdvDates)

  const enableRdvsFilter =
    !!user.rdvAccount?.hasOauthTokens &&
    (user.rdvAccount.includeRdvsInActivitesList ||
      (searchParams.rdvs?.length ?? 0) > 0)

  return (
    <MesActivitesListeLayout vue="liste">
      <MesActivitesListeHeader
        searchResultMatchesCount={searchResultMatchesCount}
        defaultFilters={searchParams}
        initialMediateursOptions={initialMediateursOptions}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        tagsOptions={tagsOptions}
        activiteDates={datesForFilters}
        enableRdvsFilter={enableRdvsFilter}
        hasCrasV1={hasCrasV1.hasCrasV1}
        activiteSourceOptions={activiteSourceOptions}
      />
      <MesActivitesListePage data={data} />
    </MesActivitesListeLayout>
  )
}

export default MesActivitesPage
