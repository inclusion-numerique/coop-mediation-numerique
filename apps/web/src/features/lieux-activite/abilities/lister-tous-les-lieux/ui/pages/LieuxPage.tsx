import { pluriel } from '@app/web/libraries/pluriel'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import type { LieuxDataTableSearchParams } from '../LieuxDataTable'
import LieuxTable from '../LieuxTable'
import type { PageDeLieux } from '../ligne-de-la-liste'
import { RechercheDeLieux } from '../RechercheDeLieux'

export const LieuxPage = ({
  totalCount,
  searchResult,
  searchParams,
}: {
  totalCount: number
  searchResult: PageDeLieux
  searchParams: LieuxDataTableSearchParams
}) => (
  <>
    <AdministrationBreadcrumbs currentPage="Lieux d’activité" />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-home-4-line">
        Lieux d’activité
      </AdministrationTitle>
      <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
        <p className="fr-text--medium fr-mb-2v">
          Rechercher dans la liste des lieux d’activité ({totalCount} au total)
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
  </>
)
