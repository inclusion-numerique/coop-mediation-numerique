import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { Departement } from '@app/web/data/collectivites-territoriales/departements'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import type { DataTableSearchParams } from '@app/web/libs/data-table/DataTableConfiguration'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import { contentId } from '@app/web/utils/skipLinks'
import Filters from './components/Filters'
import { FilterTags } from './components/FilterTags'
import LieuCard from './components/LieuCard'
import type { SearchLieuxResult } from './db/searchLieux'
import type { LieuxSearchParams } from './validation/LieuxFilters'

const pageSizeOptions = generatePageSizeSelectOptions([20, 50, 100])

const LIEUX_DEFAULT_PAGE_SIZE = 20

const getResultsLabel = ({
  totalCount,
  isFiltered,
}: {
  totalCount: number
  isFiltered: boolean
}) => {
  if (totalCount === 0) {
    return isFiltered
      ? 'Aucun lieu ne correspond à votre recherche'
      : 'Aucun lieu référencé'
  }

  return `${totalCount} ${totalCount === 1 ? 'lieu' : 'lieux'}`
}

const LieuxPage = ({
  departement,
  searchResult,
  searchParams,
  isFiltered,
  communesOptions,
  departementsOptions,
  mediateursOptions,
}: {
  departement?: Departement
  searchResult: SearchLieuxResult
  searchParams: LieuxSearchParams
  isFiltered: boolean
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  mediateursOptions: MediateurOption[]
}) => {
  const baseHref = '/coop/mon-reseau/lieux'

  const departementLabel = departement
    ? `${departement.nom} (${departement.code})`
    : null

  const retourHref = departement
    ? `/coop/mon-reseau/${departement.code}`
    : '/coop/mon-reseau'

  const breadcrumbLabel = departementLabel
    ? `Annuaire des lieux d'activités · ${departementLabel}`
    : "Annuaire des lieux d'activités"

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--800">
        <CoopBreadcrumbs
          currentPage={breadcrumbLabel}
          parents={[{ label: 'Mon réseau', linkProps: { href: retourHref } }]}
        />
        <main id={contentId} className="fr-mb-16w">
          <BackButton href={retourHref} />
          <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-6v">
            <span
              className="ri-home-office-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <div>
              <h1 className="fr-page-title fr-m-0">
                Annuaire des lieux d’activités
              </h1>
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
              placeholder="Nom du lieu, adresse ou SIRET..."
            />
            <Filters
              defaultFilters={searchParams}
              communesOptions={communesOptions}
              departementsOptions={departementsOptions}
              mediateursOptions={mediateursOptions}
            />
          </div>

          <FilterTags
            filters={searchParams}
            departementsOptions={departementsOptions}
            communesOptions={communesOptions}
            mediateursOptions={mediateursOptions}
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
                {
                  label:
                    'Par date de mise à jour (du plus récent au plus ancien)',
                  value: 'majrecent',
                },
                {
                  label:
                    'Par date de mise à jour (du plus ancien au plus récent)',
                  value: 'majancien',
                },
              ]}
              baseHref={baseHref}
            />
          </div>

          <hr className="fr-separator-1px" />

          {searchResult.lieux.map((lieu) => (
            <LieuCard
              key={lieu.id}
              lieu={lieu}
              departementCode={departement?.code ?? ''}
              lieuPageRetourHref={retourHref}
            />
          ))}

          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            totalPages={searchResult.totalPages}
            baseHref={baseHref}
            searchParams={searchParams as DataTableSearchParams}
            defaultPageSize={LIEUX_DEFAULT_PAGE_SIZE}
            pageSizeOptions={pageSizeOptions}
          />
        </main>
      </div>
    </>
  )
}

export default LieuxPage
