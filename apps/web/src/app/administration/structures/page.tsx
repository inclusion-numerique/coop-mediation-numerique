import { pluralize } from '@app/ui/utils/pluriel/pluralize'
import AdministrationCheckSiret from '@app/web/app/administration/structures/AdministrationCheckSiret'
import AdministrationSearchStructure from '@app/web/app/administration/structures/AdministrationSearchStructure'
import { getStructuresListPageData } from '@app/web/app/administration/structures/getStructuresListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationSearchStructureList from '@app/web/features/structures/use-cases/list/AdministrationSearchStructure'
import { StructuresDataTableSearchParams } from '@app/web/features/structures/use-cases/list/StructuresDataTable'
import StructuresTable from '@app/web/features/structures/use-cases/list/StructuresTable'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'

export const metadata = {
  title: metadataTitle('Structures'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<StructuresDataTableSearchParams>
}) => {
  const searchParams = await props.searchParams
  const [structuresListPageData] = await Promise.all([
    getStructuresListPageData({ searchParams }),
  ])

  return (
    <CoopPageContainer size="full">
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Structures" />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-home-4-line">
          Structures
        </AdministrationTitle>
        <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
          <p className="fr-text--medium fr-mb-2v">
            Rechercher dans la liste des structures (
            {structuresListPageData.totalCount} au total)
          </p>
          <AdministrationSearchStructureList searchParams={searchParams} />
        </div>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
          <span className="fr-text--semi-bold">
            {structuresListPageData.searchResult.matchesCount}{' '}
            {pluralize(
              'structure trouvée',
              structuresListPageData.searchResult.matchesCount,
            )}
          </span>
        </div>
        <StructuresTable
          data={structuresListPageData.searchResult}
          searchParams={searchParams}
          baseHref="/administration/structures"
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
