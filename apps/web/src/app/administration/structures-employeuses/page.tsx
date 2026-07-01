import { pluralize } from '@app/ui/utils/pluriel/pluralize'
import { getStructuresAdministrativesListPageData } from '@app/web/app/administration/structures-employeuses/getStructuresAdministrativesListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationSearchStructureAdministrative from '@app/web/features/structures/use-cases/list-administrative/AdministrationSearchStructureAdministrative'
import { type StructuresAdministrativesDataTableSearchParams } from '@app/web/features/structures/use-cases/list-administrative/StructuresAdministrativesDataTable'
import StructuresAdministrativesTable from '@app/web/features/structures/use-cases/list-administrative/StructuresAdministrativesTable'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

export const metadata = {
  title: metadataTitle('Structures employeuses'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<StructuresAdministrativesDataTableSearchParams>
}) => {
  const searchParams = await props.searchParams
  const structuresListPageData = await getStructuresAdministrativesListPageData(
    { searchParams },
  )

  return (
    <CoopPageContainer size="full">
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Structures employeuses" />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-building-line">
          Structures employeuses
        </AdministrationTitle>
        <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
          <p className="fr-text--medium fr-mb-2v">
            Rechercher dans la liste des structures employeuses (
            {structuresListPageData.totalCount} au total)
          </p>
          <AdministrationSearchStructureAdministrative
            searchParams={searchParams}
          />
        </div>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
          <span className="fr-text--semi-bold">
            {structuresListPageData.searchResult.matchesCount}{' '}
            {pluralize(
              'structure employeuse trouvée',
              structuresListPageData.searchResult.matchesCount,
            )}
          </span>
        </div>
        <StructuresAdministrativesTable
          data={structuresListPageData.searchResult}
          searchParams={searchParams}
          baseHref="/administration/structures-employeuses"
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
