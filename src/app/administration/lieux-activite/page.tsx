import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticateUser'
import { rechercherDesLieux } from '@/features/lieux-activite/abilities/lister-tous-les-lieux'
import {
  LieuxPage,
  type ListeDesLieuxSearchParams,
} from '@/features/lieux-activite/abilities/lister-tous-les-lieux/ui'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'

export const metadata = {
  title: metadataTitle('Lieux d’activité'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<ListeDesLieuxSearchParams>
}) => {
  await authenticateAdmin()
  const searchParams = await props.searchParams
  const { totalCount, searchResult } = await rechercherDesLieux({
    searchParams,
  })

  return (
    <CoopPageContainer size="full">
      <SkipLinksPortal />
      <LieuxPage
        totalCount={totalCount}
        searchResult={searchResult}
        searchParams={searchParams}
      />
    </CoopPageContainer>
  )
}

export default Page
