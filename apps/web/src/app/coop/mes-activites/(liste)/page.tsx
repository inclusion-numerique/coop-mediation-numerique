import { getAuthenticatedMediateur } from '@app/web/auth/getAuthenticatedMediateur'
import { prismaClient } from '@app/web/prismaClient'
import MesActivitesListeEmptyPage from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListeEmptyPage'
import { getActivitesListPageData } from '@app/web/app/coop/mes-activites/(liste)/getActivitesListPageData'
import MesActivitesListePage from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListePage'
import { activitesListWhere } from '@app/web/cra/searchActivite'
import { ActivitesDataTableSearchParams } from '@app/web/cra/ActivitesDataTable'
import MesActivitesListeLayout from '@app/web/app/coop/mes-activites/(liste)/MesActivitesListeLayout'
import { validateActivitesFilters } from '@app/web/cra/ActivitesFilters'
import ActivitesFilterTags from '@app/web/app/coop/mes-activites/(liste)/ActivitesFilterTags'

const MesActivitesPage = async ({
  searchParams: rawSearchParams = {},
}: {
  searchParams?: ActivitesDataTableSearchParams
}) => {
  const user = await getAuthenticatedMediateur()

  const hasActivites = await prismaClient.activiteMediateur.count({
    where: activitesListWhere({ mediateurId: user.mediateur.id }),
    take: 1,
  })

  if (hasActivites) {
    const searchParams = validateActivitesFilters(rawSearchParams)
    const data = getActivitesListPageData({
      mediateurId: user.mediateur.id,
      searchParams,
    })

    return (
      <MesActivitesListeLayout vue="liste">
        <ActivitesFilterTags defaultFilters={searchParams} />
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