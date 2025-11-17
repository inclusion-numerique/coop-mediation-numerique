import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import type { ActivitesDataTableSearchParams } from '@app/web/features/activites/use-cases/list/components/ActivitesDataTable'
import ActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/ActivitesListeLayout'
import MesActivitesListeEmptyPage from '@app/web/features/activites/use-cases/list/components/MesActivitesListeEmptyPage'
import MesActivitesListeHeader from '@app/web/features/activites/use-cases/list/components/MesActivitesListeHeader'
import { mediateurHasActivites } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { getWidestActiviteDatesRange } from '@app/web/features/activites/use-cases/list/db/getWidestActiviteDatesRange'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import MesActivitesTableauPage from '@app/web/features/activites/use-cases/list/MesActivitesTableauPage'
import { validateActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'

const MesActivitesVueTableauPage = async ({
  searchParams,
}: {
  searchParams: Promise<
    ActivitesDataTableSearchParams & { 'voir-rdvs'?: string }
  >
}) => {
  const rawSearchParams = await searchParams
  const user = await authenticateMediateur()

  const showRdvsInList = rawSearchParams['voir-rdvs'] === '1'

  const hasActivites = await mediateurHasActivites({
    mediateurId: user.mediateur.id,
  })

  if (hasActivites) {
    const searchParams = validateActivitesFilters(rawSearchParams)
    const data = getActivitesListPageData({
      mediateurId: user.mediateur.id,
      searchParams,
      user,
      showRdvsInList,
    })

    const searchResultMatchesCount = data.then(
      ({ searchResult: { accompagnementsMatchesCount } }) =>
        accompagnementsMatchesCount,
    )

    const includeRdvsFilter =
      !!user.rdvAccount?.hasOauthTokens &&
      (user.rdvAccount.includeRdvsInActivitesList || showRdvsInList)

    const {
      communesOptions,
      departementsOptions,
      initialMediateursOptions,
      lieuxActiviteOptions,
      tagsOptions,
      activiteDates,
      activiteSourceOptions,
      hasCrasV1,
      rdvDates,
    } = await getFiltersOptionsForMediateur({
      user,
      includeBeneficiaireIds: searchParams.beneficiaires,
    })

    const filterPeriodDates = getWidestActiviteDatesRange(
      activiteDates,
      rdvDates,
    )

    return (
      <ActivitesListeLayout
        vue="tableau"
        href="/coop/mes-activites"
        subtitle={
          isCoordinateur(user) && isMediateur(user)
            ? 'Médiation numérique'
            : undefined
        }
      >
        <MesActivitesListeHeader
          searchResultMatchesCount={searchResultMatchesCount}
          defaultFilters={searchParams}
          initialMediateursOptions={initialMediateursOptions}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          tagsOptions={tagsOptions}
          activiteDates={filterPeriodDates}
          enableRdvsFilter={includeRdvsFilter}
          hasCrasV1={hasCrasV1.hasCrasV1}
          activiteSourceOptions={activiteSourceOptions}
        />
        <MesActivitesTableauPage data={data} />
      </ActivitesListeLayout>
    )
  }

  return (
    <ActivitesListeLayout vue="tableau" href="/coop/mes-activites">
      <MesActivitesListeEmptyPage />
    </ActivitesListeLayout>
  )
}

export default MesActivitesVueTableauPage
