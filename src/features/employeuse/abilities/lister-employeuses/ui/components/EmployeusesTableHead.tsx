import { EnTeteTriable } from '@/libraries/etat-d-url/liste/EnTeteTriable'
import { employeusesColumns } from '../columns/employeuses.columns'
import type { BarreDesEmployeuses } from '../presenters/barre-des-employeuses.presenter'

export const EmployeusesTableHead = ({
  colonnes,
}: {
  colonnes: BarreDesEmployeuses['colonnes']
}) => (
  <thead>
    <tr>
      {employeusesColumns.map(({ label, tri }) =>
        tri ? (
          <EnTeteTriable key={label} libelle={label} lien={colonnes[tri]} />
        ) : (
          <th key={label} scope="col">
            {label}
          </th>
        ),
      )}
      <th className="fr-sr-only">Fiche structure employeuse</th>
    </tr>
  </thead>
)
