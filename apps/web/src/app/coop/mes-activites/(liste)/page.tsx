import { getAuthenticatedMediateur } from '@app/web/auth/getAuthenticatedMediateur'
import MesActivitesListeEmptyPage from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListeEmptyPage'
import { getActivitesListPageData } from '@app/web/app/coop/mes-activites/(liste)/getActivitesListPageData'
import MesActivitesListePage from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListePage'
import type { ActivitesDataTableSearchParams } from '@app/web/cra/ActivitesDataTable'
import MesActivitesListeLayout from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListeLayout'
import { validateActivitesFilters } from '@app/web/cra/ActivitesFilters'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import { mediateurHasActivites } from '@app/web/cra/activitesQueries'
import MesActivitesListeHeader from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListeHeader'

const MesActivitesPage = async ({
  searchParams: rawSearchParams = {},
}: {
  searchParams?: ActivitesDataTableSearchParams
}) => {
  const user = await getAuthenticatedMediateur()

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
      initialBeneficiairesOptions,
      lieuxActiviteOptions,
    } = await getFiltersOptionsForMediateur({
      mediateurId: user.mediateur.id,
      includeBeneficiaireId: searchParams.beneficiaire,
    })

    return (
      <MesActivitesListeLayout vue="liste">
        <MesActivitesListeHeader
          searchResultMatchesCount={searchResultMatchesCount}
          defaultFilters={searchParams}
          initialBeneficiairesOptions={initialBeneficiairesOptions}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
        />
        <MesActivitesListePage data={data} />
      </MesActivitesListeLayout>
    )
  }

  return (
    <MesActivitesListeLayout vue="liste">
      <MesActivitesListeEmptyPage />
    </MesActivitesListeLayout>
  )
}

export default MesActivitesPage
