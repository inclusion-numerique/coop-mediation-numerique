import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { pluralize } from '@app/ui/utils/pluriel/pluralize'
import { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import AdministrationSearchUtilisateur from '../../components/AdministrationSearchUtilisateur'
import { FilterTags } from '../filter/FilterTags'
import Filters from '../filter/Filters'
import { generateUtilisateursFiltersLabels } from '../filter/generateUtilisateursFiltersLabels'
import { UtilisateursFilters } from '../filter/utilisateursFilters'
import { SearchUtilisateurResult } from '../search/searchUtilisateur'
import ExportUtilisateursButton from './ExportUtilisateursButton'
import { type UtilisateursDataTableSearchParams } from './UtilisateursDataTable'
import UtilisateursTable from './UtilisateursTable'

export const UtilisateurListPage = ({
  searchParams,
  filters,
  lieuxActiviteOptions,
  communesOptions,
  departementsOptions,
  searchResult,
}: {
  searchParams: UtilisateursDataTableSearchParams
  filters: UtilisateursFilters
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  searchResult: SearchUtilisateurResult
}) => (
  <>
    <AdministrationBreadcrumbs currentPage="Utilisateurs" />
    <AdministrationTitle
      icon="fr-icon-team-line"
      actions={[
        <ExportUtilisateursButton
          filters={filters}
          filterLabels={generateUtilisateursFiltersLabels(filters, {
            communesOptions,
            departementsOptions,
            lieuxActiviteOptions,
          })}
          matchesCount={searchResult.matchesCount}
          recherche={searchParams.recherche}
        />,
      ]}
    >
      Utilisateurs
    </AdministrationTitle>
    <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
      <p className="fr-text--medium fr-mb-2v">
        Rechercher dans la liste des utilisateurs inscrits
      </p>
      <AdministrationSearchUtilisateur searchParams={searchParams} />
    </div>
    <div className="fr-flex fr-justify-content-space-between fr-align-items-center">
      <Filters
        defaultFilters={filters}
        lieuxActiviteOptions={lieuxActiviteOptions}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
      />
      <span className="fr-text--semi-bold">
        {searchResult.matchesCount}{' '}
        {pluralize('utilisateur trouvé', searchResult.matchesCount)}
      </span>
    </div>
    <hr className="fr-mt-6v fr-pb-4v" />
    <FilterTags
      filters={filters}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
      lieuxActiviteOptions={lieuxActiviteOptions}
    />
    <UtilisateursTable
      data={searchResult}
      searchParams={searchParams}
      baseHref="/administration/utilisateurs"
    />
  </>
)
