import { creerActiviteDepuisRdvAction } from '@app/web/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@app/web/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import type { ActivitesDataTableSearchParams } from '@app/web/features/activites/use-cases/list/components/ActivitesDataTable'
import ActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/ActivitesListeLayout'
import MesActivitesListeHeader from '@app/web/features/activites/use-cases/list/components/MesActivitesListeHeader'
import { getWidestActiviteDatesRange } from '@app/web/features/activites/use-cases/list/db/getWidestActiviteDatesRange'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import { getActivitesTagsOptions } from '@app/web/features/activites/use-cases/list/getActivitesTagsOptions'
import MesActivitesListePage from '@app/web/features/activites/use-cases/list/MesActivitesListePage'
import { validateActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.key'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités'),
}

const MesActivitesPage = async ({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<
    ActivitesDataTableSearchParams & { 'voir-rdvs'?: string }
  >
}) => {
  const user = await authenticateMediateur()

  const unvalidatedSearchParams = await rawSearchParams
  const searchParams = validateActivitesFilters(unvalidatedSearchParams)
  const showRdvsInList = unvalidatedSearchParams['voir-rdvs'] === '1'

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

  const {
    communesOptions,
    departementsOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    structuresEmployeusesOptions,
    activiteDates, // TODO include rdv dates
    rdvDates,
    activiteSourceOptions,
    hasCrasV1,
  } = await getFiltersOptionsForMediateur({
    user,
    includeBeneficiaireIds: searchParams.beneficiaires,
  })

  const tagsOptions = await getActivitesTagsOptions(user.mediateur.id)

  const datesForFilters = getWidestActiviteDatesRange(activiteDates, rdvDates)

  const enableRdvsFilter =
    !!user.rdvAccount?.hasOauthTokens &&
    (user.rdvAccount.includeRdvsInActivitesList ||
      (searchParams.rdvs?.length ?? 0) > 0 ||
      showRdvsInList)

  return (
    <ClientBinder
      bind={CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY}
      to={creerActiviteDepuisRdvAction}
    >
      <ClientBinder
        bind={METTRE_A_JOUR_STATUT_RDV_ACTION_KEY}
        to={mettreAJourStatutRdvAction}
      >
        <ActivitesListeLayout
          vue="liste"
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
            structuresEmployeusesOptions={structuresEmployeusesOptions}
            tagsOptions={tagsOptions}
            activiteDates={datesForFilters}
            enableRdvsFilter={enableRdvsFilter}
            hasCrasV1={hasCrasV1.hasCrasV1}
            activiteSourceOptions={activiteSourceOptions}
          />
          <MesActivitesListePage data={data} />
        </ActivitesListeLayout>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesActivitesPage
