import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import MesActivitesListePage from '@app/web/features/activites/use-cases/list/MesActivitesListePage'
import type { ActivitesDataTableSearchParams } from '@app/web/features/activites/use-cases/list/components/ActivitesDataTable'
import MesActivitesListeEmptyPage from '@app/web/features/activites/use-cases/list/components/MesActivitesListeEmptyPage'
import MesActivitesListeHeader from '@app/web/features/activites/use-cases/list/components/MesActivitesListeHeader'
import MesActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/MesActivitesListeLayout'
import { mediateurHasActivites } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import { validateActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
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
    ({ searchResult: { matchesCount } }) => matchesCount,
  )

  const {
    communesOptions,
    departementsOptions,
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    activiteDates,
  } = await getFiltersOptionsForMediateur({
    user,
    includeBeneficiaireIds: searchParams.beneficiaires,
  })

  return (
    <MesActivitesListeLayout vue="liste">
      <MesActivitesListeHeader
        searchResultMatchesCount={searchResultMatchesCount}
        defaultFilters={searchParams}
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        initialMediateursOptions={initialMediateursOptions}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        activiteDates={activiteDates}
      />
      <MesActivitesListePage data={data} />
    </MesActivitesListeLayout>
  )
}

export default MesActivitesPage
