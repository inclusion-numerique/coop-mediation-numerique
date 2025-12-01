import { getUtilisateursListPageData } from '@app/web/app/administration/utilisateurs/getUtilisateursListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import {
  UtilisateursFilters,
  utilisateursFilters,
} from '@app/web/features/utilisateurs/use-cases/filter/utilisateursFilters'
import { statutCompte } from '@app/web/features/utilisateurs/use-cases/list/statut-compte'
import { UtilisateurListPage } from '@app/web/features/utilisateurs/use-cases/list/UtilisateurListPage'
import { UtilisateursDataTableSearchParams } from '@app/web/features/utilisateurs/use-cases/list/UtilisateursDataTable'

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
  )
}

export default Page
