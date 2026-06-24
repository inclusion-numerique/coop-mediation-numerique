import {
  type DataTableUrlState,
  SelectAllHeaderCell,
  SortableColumnHeader,
} from '@app/web/libraries/data-table'
import { beneficiairesColumns } from './beneficiaires-columns'

export const BeneficiairesTableHead = ({
  state,
  baseHref,
  allSelected,
  someSelected,
  onToggleAll,
}: {
  state: DataTableUrlState
  baseHref: string
  allSelected: boolean
  someSelected: boolean
  onToggleAll: () => void
}) => (
  <thead>
    <tr>
      <SelectAllHeaderCell
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        onToggle={onToggleAll}
      />
      {beneficiairesColumns.map((column) => (
        <SortableColumnHeader
          key={column.tri}
          label={column.label}
          tri={column.tri}
          state={state}
          baseHref={baseHref}
          isDefault={column.isDefault}
          className={column.alignRight ? 'fr-text--right' : undefined}
        />
      ))}
    </tr>
  </thead>
)
