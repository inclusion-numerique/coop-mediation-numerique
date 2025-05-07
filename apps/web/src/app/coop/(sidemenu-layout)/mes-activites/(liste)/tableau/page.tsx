import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import MesActivitesTableauPage from '@app/web/features/activites/use-cases/list/MesActivitesTableauPage'
import type { ActivitesDataTableSearchParams } from '@app/web/features/activites/use-cases/list/components/ActivitesDataTable'
import MesActivitesListeEmptyPage from '@app/web/features/activites/use-cases/list/components/MesActivitesListeEmptyPage'
import MesActivitesListeHeader from '@app/web/features/activites/use-cases/list/components/MesActivitesListeHeader'
import MesActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/MesActivitesListeLayout'
import { mediateurHasActivites } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import { validateActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'

const MesActivitesVueTableauPage = async ({
  searchParams,
}: {
  searchParams: Promise<ActivitesDataTableSearchParams>
}) => {
  const rawSearchParams = await searchParams
  const user = await authenticateMediateur()

  const hasActivites = await mediateurHasActivites({
    mediateurId: user.mediateur.id,
  })

  if (hasActivites) {
    const searchParams = validateActivitesFilters(rawSearchParams)
    const data = getActivitesListPageData({
      mediateurId: user.mediateur.id,
      searchParams,
    })

    const searchResultMatchesCount = data.then(
      ({ searchResult: { matchesCount } }) => matchesCount,
    )

    const {
      communesOptions,
      departementsOptions,
      initialMediateursOptions,
      initialBeneficiairesOptions,
      lieuxActiviteOptions,
      activiteDates,
    } = await getFiltersOptionsForMediateur({
      user,
      includeBeneficiaireIds: searchParams.beneficiaires,
    })

    return (
      <MesActivitesListeLayout vue="tableau">
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
        <MesActivitesTableauPage data={data} />
      </MesActivitesListeLayout>
    )
  }

  return (
    <MesActivitesListeLayout vue="tableau">
      <MesActivitesListeEmptyPage />
    </MesActivitesListeLayout>
  )
}

export default MesActivitesVueTableauPage
