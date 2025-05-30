import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import Button from '@codegouvfr/react-dsfr/Button'
import DataFilters from './DataFilters'
import DataSearchBar from './DataSearchBar'
import {
  DataTableConfiguration,
  DataTableFilterValues,
  DataTableRow,
  DataTableSearchParams,
} from './DataTableConfiguration'

/**
 * Server component orchestrating the render of search bar and filter client components
 */
const DataSearchAndFilters = async <
  Data extends DataTableRow,
  Configuration extends DataTableConfiguration<Data>,
>({
  configuration,
  searchParams,
  baseHref,
  filterValues,
}: {
  configuration: Configuration
  searchParams: DataTableSearchParams<Configuration>
  baseHref: string
  // TODO used ?
  data: Data[]
  filterValues: DataTableFilterValues<Configuration>
}) => {
  const filterConfigurations = configuration.columns
    .map((column) => column.filters)
    .filter(onlyDefinedAndNotNull)
    .flat()

  const filterComponents = await Promise.all(
    filterConfigurations.map(async (filterConfiguration) => {
      const _options =
        'options' in filterConfiguration
          ? Array.isArray(filterConfiguration.options)
            ? filterConfiguration.options
            : typeof filterConfiguration.options === 'function'
              ? await filterConfiguration.options()
              : []
          : []
      // TODO reuse filters from Les Bases ?

      return (
        <Button
          key={filterConfiguration.name}
          className="fr-border-radius--8"
          priority="tertiary"
          type="button"
          iconPosition="right"
          iconId="fr-icon-arrow-down-s-line"
        >
          {filterConfiguration.title}
        </Button>
      )
    }),
  )

  return (
    <DataFilters
      initialyShown={Object.keys(filterValues).length > 0}
      searchParams={searchParams}
      baseHref={baseHref}
      filterComponents={filterComponents}
      filterValues={filterValues}
      searchBar={
        <DataSearchBar
          searchParams={searchParams as DataTableSearchParams}
          baseHref={baseHref}
        />
      }
    />
  )
}

export default DataSearchAndFilters
