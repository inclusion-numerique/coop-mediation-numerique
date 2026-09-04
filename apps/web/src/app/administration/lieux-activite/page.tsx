import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { rechercherDesLieux } from '@app/web/features/lieux-activite/abilities/lister-tous-les-lieux'
import {
  LieuxDataTable,
  type LieuxDataTableSearchParams,
  LieuxTable,
  RechercheDeLieux,
} from '@app/web/features/lieux-activite/abilities/lister-tous-les-lieux/ui'
import { pluriel } from '@app/web/libraries/pluriel'
import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

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
    // Le tri se lit dans les colonnes de la table : c'est elle qui sait
    // lesquelles sont triables, et selon quel champ.
    orderBy: getDataTableOrderBy(searchParams, LieuxDataTable),
  })

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
            Rechercher dans la liste des lieux d’activité ({totalCount} au
            total)
          </p>
          <RechercheDeLieux searchParams={searchParams} />
        </div>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
          <span className="fr-text--semi-bold">
            {searchResult.matchesCount}{' '}
            {pluriel(
              searchResult.matchesCount,
              'lieu d’activité trouvé',
              'lieux d’activité trouvés',
            )}
          </span>
        </div>
        <LieuxTable
          data={searchResult}
          searchParams={searchParams}
          baseHref="/administration/lieux-activite"
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
