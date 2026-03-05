import { pluralize } from '@app/ui/utils/pluriel/pluralize'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import { SearchStructuresResult } from '../search/searchStructures'
import AdministrationSearchStructure from './AdministrationSearchStructure'
import { type StructuresDataTableSearchParams } from './StructuresDataTable'
import StructuresTable from './StructuresTable'

export const StructureListPage = ({
  searchParams,
  searchResult,
  totalCount,
}: {
  searchParams: StructuresDataTableSearchParams
  searchResult: SearchStructuresResult
  totalCount: number
}) => (
  <>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Structures" />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-home-4-line">
        Structures
      </AdministrationTitle>
      <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
        <p className="fr-text--medium fr-mb-2v">
          Rechercher dans la liste des structures ({totalCount} au total)
        </p>
        <AdministrationSearchStructure searchParams={searchParams} />
      </div>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
        <span className="fr-text--semi-bold">
          {searchResult.matchesCount}{' '}
          {pluralize('structure trouv\u00e9e', searchResult.matchesCount)}
        </span>
      </div>
      <StructuresTable
        data={searchResult}
        searchParams={searchParams}
        baseHref="/administration/structures"
      />
    </main>
  </>
)
