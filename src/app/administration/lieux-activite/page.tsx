import CoopPageContainer from '@/app/coop/CoopPageContainer'
import { metadataTitle } from '@/app/metadataTitle'
import { rechercherDesLieux } from '@/features/lieux-activite/abilities/lister-tous-les-lieux'
import {
  LieuxPage,
  type ListeDesLieuxSearchParams,
} from '@/features/lieux-activite/abilities/lister-tous-les-lieux/ui'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'

export const metadata = {
  title: metadataTitle('Lieux d’activité'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<ListeDesLieuxSearchParams>
}) => {
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
