import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { Departement } from '@app/web/data/collectivites-territoriales/departements'
import { getMonReseauBreadcrumbParents } from '@app/web/features/mon-reseau/getMonReseauBreadcrumbParents'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import type { DataTableSearchParams } from '@app/web/libs/data-table/DataTableConfiguration'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import { contentId } from '@app/web/utils/skipLinks'
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
}: {
  departement: Departement
  searchResult: SearchActeursResult
  searchParams: ActeursSearchParams
  isFiltered: boolean
  communesOptions: SelectOption[]
}) => {
  const baseHref = `/coop/mon-reseau/${departement.code}/acteurs`

  const departementLabel = `${departement.nom} (${departement.code})`

  const breadcrumbLabel = 'Annuaire des acteurs'

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium">
        <CoopBreadcrumbs
          currentPage={breadcrumbLabel}
          parents={getMonReseauBreadcrumbParents({ code: departement.code })}
        />
        <main id={contentId} className="fr-mb-16w fr-mt-8v">
          <BackButton />
          <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-6v">
            <span
              className="fr-icon-team-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <div>
              <h1 className="fr-page-title fr-m-0">Annuaire des acteurs</h1>
              <p className="fr-text--sm fr-text--bold fr-text-mention--grey fr-mb-0 fr-mt-1v">
                {departementLabel.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-4v">
            <DataSearchBar
              baseHref={baseHref}
              searchParams={searchParams as DataTableSearchParams}
              placeholder="Nom, prénom ou adresse mail..."
              className="fr-flex-grow-1"
            />
            <Filters
              defaultFilters={searchParams}
              communesOptions={communesOptions}
            />
          </div>

          <FilterTags
            filters={searchParams}
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

          {searchResult.acteurs.map((acteur) => (
            <ActeurCard
              key={acteur.id}
              acteur={acteur}
              departementCode={departement.code}
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
      </div>
    </>
  )
}

export default ActeursPage
