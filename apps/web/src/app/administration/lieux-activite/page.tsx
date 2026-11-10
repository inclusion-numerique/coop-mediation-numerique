import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import {
  rechercherDesLieux,
  triDesLieux,
} from '@app/web/features/lieux-activite/abilities/lister-tous-les-lieux'
import {
  LieuxDataTable,
  type LieuxDataTableSearchParams,
  LieuxPage,
} from '@app/web/features/lieux-activite/abilities/lister-tous-les-lieux/ui'
import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'

export const metadata = {
  title: metadataTitle('Lieux d’activité'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<LieuxDataTableSearchParams>
}) => {
  const searchParams = await props.searchParams
  const { totalCount, searchResult } = await rechercherDesLieux({
    searchParams,
    // La table dit quelles colonnes sont triables, le référentiel dit sur quoi
    // elles se trient : la route les rapproche, et aucun des deux n'a besoin de
    // connaître l'autre.
    orderBy: getDataTableOrderBy(searchParams, LieuxDataTable, triDesLieux),
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
