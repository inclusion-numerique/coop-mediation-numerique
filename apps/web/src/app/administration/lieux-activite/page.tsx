import AdministrationCheckSiret from '@app/web/app/administration/lieux-activite/AdministrationCheckSiret'
import AdministrationSearchStructure from '@app/web/app/administration/lieux-activite/AdministrationSearchStructure'
import { getStructuresListPageData } from '@app/web/app/administration/lieux-activite/getStructuresListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationSearchLieu from '@app/web/features/structures/use-cases/list/AdministrationSearchLieu'
import { LieuxDataTableSearchParams } from '@app/web/features/structures/use-cases/list/LieuxDataTable'
import LieuxTable from '@app/web/features/structures/use-cases/list/LieuxTable'
import { pluriel } from '@app/web/libraries/pluriel'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'

export const metadata = {
  title: metadataTitle('Lieux d’activité'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<LieuxDataTableSearchParams>
}) => {
  const searchParams = await props.searchParams
  const [structuresListPageData] = await Promise.all([
    getStructuresListPageData({ searchParams }),
  ])

  return (
    <CoopPageContainer size="full">
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Lieux d’activité" />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-home-4-line">
          Lieux d’activité
        </AdministrationTitle>
        <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
          <p className="fr-text--medium fr-mb-2v">
            Rechercher dans la liste des lieux d’activité (
            {structuresListPageData.totalCount} au total)
          </p>
          <AdministrationSearchLieu searchParams={searchParams} />
        </div>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
          <span className="fr-text--semi-bold">
            {structuresListPageData.searchResult.matchesCount}{' '}
            {pluriel(
              structuresListPageData.searchResult.matchesCount,
              'lieu d’activité trouvé',
              'lieux d’activité trouvés',
            )}
          </span>
        </div>
        <LieuxTable
          data={structuresListPageData.searchResult}
          searchParams={searchParams}
          baseHref="/administration/lieux-activite"
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
