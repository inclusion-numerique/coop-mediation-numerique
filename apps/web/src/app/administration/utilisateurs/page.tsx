import { getUtilisateursListPageData } from '@app/web/app/administration/utilisateurs/getUtilisateursListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import {
  UtilisateursFilters,
  utilisateursFilters,
} from '@app/web/features/utilisateurs/use-cases/filter/utilisateursFilters'
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

  const filters = utilisateursFilters(searchParams)

  return (
    <CoopPageContainer size="full">
      <UtilisateurListPage {...utilisateursListPageData} filters={filters} />
    </CoopPageContainer>
  )
}

export default Page
