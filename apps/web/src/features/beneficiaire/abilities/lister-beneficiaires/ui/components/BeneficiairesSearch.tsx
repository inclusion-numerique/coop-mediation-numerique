import {
  DataSearchBar,
  type DataTableUrlState,
} from '@app/web/libraries/data-table'

export const BeneficiairesSearch = ({
  state,
  baseHref,
}: {
  state: DataTableUrlState
  baseHref: string
}) => (
  <DataSearchBar
    className="fr-flex-grow-1"
    baseHref={baseHref}
    state={state}
    placeholder="Rechercher parmi vos bénéficiaires enregistrés"
  />
)
