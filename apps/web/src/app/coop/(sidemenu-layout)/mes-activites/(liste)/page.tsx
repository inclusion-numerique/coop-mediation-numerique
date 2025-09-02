import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import type { ActivitesDataTableSearchParams } from '@app/web/features/activites/use-cases/list/components/ActivitesDataTable'
import MesActivitesListeHeader from '@app/web/features/activites/use-cases/list/components/MesActivitesListeHeader'
import MesActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/MesActivitesListeLayout'
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
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    tagsOptions,
    activiteDates,
  } = await getFiltersOptionsForMediateur({
    user,
    includeBeneficiaireIds: searchParams.beneficiaires,
  })

  const hasFeature = hasFeatureFlag(user, 'RdvServicePublic')

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
        tagsOptions={tagsOptions}
        activiteDates={activiteDates}
        enableRdvsFilter={hasFeature}
      />
      <MesActivitesListePage data={data} />
    </MesActivitesListeLayout>
  )
}

export default MesActivitesPage
