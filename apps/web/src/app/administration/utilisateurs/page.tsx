import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { getUtilisateursListPageData } from '@app/web/app/administration/utilisateurs/getUtilisateursListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import {
  UtilisateursFilters,
  utilisateursFilters,
} from '@app/web/features/utilisateurs/use-cases/filter/utilisateursFilters'
import { statutCompte } from '@app/web/features/utilisateurs/use-cases/list/statut-compte'
import { UtilisateurListPage } from '@app/web/features/utilisateurs/use-cases/list/UtilisateurListPage'
import { UtilisateursDataTableSearchParams } from '@app/web/features/utilisateurs/use-cases/list/UtilisateursDataTable'
import { ClientBinder } from '@app/web/libs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Utilisateurs'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<UtilisateursDataTableSearchParams & UtilisateursFilters>
}) => {
  const searchParams = await props.searchParams
  const utilisateursListPageData = await getUtilisateursListPageData({
    searchParams,
  })

  const utilisateurs = utilisateursListPageData.searchResult.utilisateurs.map(
    (user) => ({
      ...user,
      statutCompte: statutCompte(new Date())(user),
    }),
  )

  const filters = utilisateursFilters(searchParams)

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <CoopPageContainer size="full">
        <UtilisateurListPage
          {...{
            ...utilisateursListPageData,
            searchResult: {
              ...utilisateursListPageData.searchResult,
              utilisateurs,
            },
          }}
          filters={filters}
        />
      </CoopPageContainer>
    </ClientBinder>
  )
}

export default Page
