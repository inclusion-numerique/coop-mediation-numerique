import { EnTeteTriable } from '@/libraries/etat-d-url/EnTeteTriable'
import { employeusesColumns } from '../columns/employeuses.columns'
import type { BarreDesEmployeuses } from '../presenters/barre-des-employeuses.presenter'

export const EmployeusesTableHead = ({
  colonnes,
}: {
  colonnes: BarreDesEmployeuses['colonnes']
}) => (
  <thead>
    <tr>
      {employeusesColumns.map((column) =>
        'tri' in column ? (
          <EnTeteTriable key={column.tri} lien={colonnes[column.tri]} />
        ) : (
          <th key={column.label} scope="col">
            {column.label}
          </th>
        ),
      )}
      <th className="fr-sr-only">Fiche structure employeuse</th>
    </tr>
  </thead>
)
