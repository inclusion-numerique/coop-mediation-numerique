import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { pluriel } from '@/libraries/pluriel'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import { LieuxPagination } from '../components/LieuxPagination'
import { LieuxTable } from '../components/LieuxTable'
import { RechercheDeLieux } from '../components/RechercheDeLieux'
import type { PageDeLieux } from '../presenters/ligne-de-la-liste'
import {
  type ListeDesLieuxSearchParams,
  toDataTableUrlState,
} from '../presenters/lister-tous-les-lieux-search-params'

const baseHref = '/administration/lieux-activite'

export const LieuxPage = ({
  totalCount,
  searchResult,
  searchParams,
}: {
  totalCount: number
  searchResult: PageDeLieux
  searchParams: ListeDesLieuxSearchParams
}) => (
  <CoopPageContainer size="full">
    <SkipLinksPortal />
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
        lignes={searchResult.structures}
        state={toDataTableUrlState(searchParams)}
        baseHref={baseHref}
      />
      <LieuxPagination
        state={toDataTableUrlState(searchParams)}
        baseHref={baseHref}
        itemsCount={searchResult.matchesCount}
        pageSize={searchResult.pageSize}
      />
    </main>
  </CoopPageContainer>
)
