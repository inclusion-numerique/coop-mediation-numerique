import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { Departement } from '@app/web/data/collectivites-territoriales/departements'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import type { DataTableSearchParams } from '@app/web/libs/data-table/DataTableConfiguration'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'
import ActeurCard from './components/ActeurCard'
import Filters from './components/Filters'
import { FilterTags } from './components/FilterTags'
import type { SearchActeursResult } from './db/searchActeurs'
import type { ActeursSearchParams } from './validation/ActeursFilters'

const pageSizeOptions = generatePageSizeSelectOptions([20, 50, 100])

const ACTEURS_DEFAULT_PAGE_SIZE = 20

const getResultsLabel = ({
  totalCount,
  isFiltered,
}: {
  totalCount: number
  isFiltered: boolean
}) => {
  if (totalCount === 0) {
    return isFiltered
      ? 'Aucun acteur ne correspond à votre recherche'
      : 'Aucun acteur référencé'
  }

  return `${totalCount} acteur${sPluriel(totalCount)} référencé${sPluriel(totalCount)}`
}

const ActeursPage = ({
  departement,
  searchResult,
  searchParams,
  isFiltered,
  communesOptions,
  departementsOptions,
  lieuxActiviteOptions,
  currentPath,
}: {
  departement?: Departement
  searchResult: SearchActeursResult
  searchParams: ActeursSearchParams
  isFiltered: boolean
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  currentPath: string
}) => {
  const baseHref = '/coop/mon-reseau/acteurs'

  const departementLabel = departement
    ? `${departement.nom} (${departement.code})`
    : null

  const retourHref = departement
    ? `/coop/mon-reseau/${departement.code}`
    : '/coop/mon-reseau'

  const breadcrumbLabel = departementLabel
    ? `Annuaire des acteurs · ${departementLabel}`
    : 'Annuaire des acteurs'

  return (
    <CoopPageContainer size={49}>
      <SkipLinksPortal />
      <main id={contentId}>
        <nav
          className="fr-breadcrumb fr-mt-4v"
          role="navigation"
          aria-label="vous êtes ici"
        >
          <ol className="fr-breadcrumb__list">
            <li>
              <Link className="fr-breadcrumb__link" href="/coop">
                Accueil
              </Link>
            </li>
            <li>
              <Link className="fr-breadcrumb__link" href={retourHref}>
                Mon réseau
              </Link>
            </li>
            <li>
              <span className="fr-breadcrumb__link" aria-current="page">
                {breadcrumbLabel}
              </span>
            </li>
          </ol>
        </nav>

        <div className="fr-flex fr-align-items-center fr-mt-8v fr-mb-4v">
          <Link className="fr-link fr-link--sm fr-mr-4v" href={retourHref}>
            <span className="fr-icon-arrow-left-line fr-icon--sm" aria-hidden />
            &nbsp;Retour
          </Link>
        </div>

        <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-6v">
          <span
            className="fr-icon-team-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
            aria-hidden
          />
          <div>
            <h1 className="fr-page-title fr-m-0">Annuaire des acteurs</h1>
            {departementLabel && (
              <p className="fr-text--sm fr-text--bold fr-text-mention--grey fr-mb-0 fr-mt-1v">
                {departementLabel.toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-4v">
          <DataSearchBar
            baseHref={baseHref}
            searchParams={searchParams as DataTableSearchParams}
            placeholder="Nom, prénom ou adresse mail..."
          />
          <Filters
            defaultFilters={searchParams}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
          />
        </div>

        <FilterTags
          filters={searchParams}
          lieuxActiviteOptions={lieuxActiviteOptions}
          departementsOptions={departementsOptions}
          communesOptions={communesOptions}
        />

        <hr className="fr-separator-1px" />

        <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-my-4v">
          <h2 className="fr-text--bold fr-text--lg fr-mb-0">
            {getResultsLabel({
              totalCount: searchResult.totalCount,
              isFiltered,
            })}
          </h2>
          <SortSelect
            options={[
              { label: 'Nom (A à Z)', value: 'nomaz' },
              { label: 'Nom (Z à A)', value: 'nomza' },
            ]}
            baseHref={baseHref}
          />
        </div>

        <hr className="fr-separator-1px" />

        {searchResult.acteurs.map((acteur, index) => (
          <ActeurCard
            key={acteur.id}
            acteur={acteur}
            currentPath={currentPath}
          />
        ))}

        <PaginationNavWithPageSizeSelect
          className="fr-mt-12v"
          totalPages={searchResult.totalPages}
          baseHref={baseHref}
          searchParams={searchParams as DataTableSearchParams}
          defaultPageSize={ACTEURS_DEFAULT_PAGE_SIZE}
          pageSizeOptions={pageSizeOptions}
        />
      </main>
    </CoopPageContainer>
  )
}

export default ActeursPage
