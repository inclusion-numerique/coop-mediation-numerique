import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import { rechercherDesLieux } from '@/features/lieux-activite/abilities/lister-tous-les-lieux/implementations/prisma/rechercher-des-lieux.query'
import { LieuxPage } from '@/features/lieux-activite/abilities/lister-tous-les-lieux/ui/pages/LieuxPage'
import { type ListeDesLieuxSearchParams } from '@/features/lieux-activite/abilities/lister-tous-les-lieux/ui/presenters/lister-tous-les-lieux.search-params'

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
    <LieuxPage
      totalCount={totalCount}
      searchResult={searchResult}
      searchParams={searchParams}
    />
  )
}

export default Page
