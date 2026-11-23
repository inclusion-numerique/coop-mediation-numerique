import {
  type DataTableUrlState,
  SortableColumnHeader,
} from '@/libraries/data-table'
import {
  type EmployeuseColumn,
  employeusesColumns,
} from '../presenters/employeuses.columns'

const EnTeteDeColonne = ({
  column,
  state,
  baseHref,
}: {
  column: EmployeuseColumn
  state: DataTableUrlState
  baseHref: string
}) =>
  column.tri ? (
    <SortableColumnHeader
      label={column.label}
      tri={column.tri}
      state={state}
      baseHref={baseHref}
      isDefault={column.isDefault}
    />
  ) : (
    <th scope="col">{column.label}</th>
  )

export const EmployeusesTableHead = ({
  state,
  baseHref,
}: {
  state: DataTableUrlState
  baseHref: string
}) => (
  <thead>
    <tr>
      {employeusesColumns.map((column) => (
        <EnTeteDeColonne
          key={column.label}
          column={column}
          state={state}
          baseHref={baseHref}
        />
      ))}
      <th className="fr-sr-only">Fiche structure employeuse</th>
    </tr>
  </thead>
)
