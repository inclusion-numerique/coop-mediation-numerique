import { DataTable, type DataTableUrlState } from '@/libraries/data-table'
import type { EmployeuseAffichee } from '../presenters/employeuse-affichee.presenter'
import { employeusesColumns } from '../presenters/employeuses.columns'
import { EmployeusesPagination } from './EmployeusesPagination'
import { EmployeusesTableHead } from './EmployeusesTableHead'
import { EmployeuseTableRow } from './EmployeuseTableRow'

const AucunResultat = () => (
  <tr>
    <td colSpan={employeusesColumns.length + 1}>Aucun résultat</td>
  </tr>
)

const EmployeusesTable = ({
  employeuses,
  trouvees,
  parPage,
  state,
  baseHref,
}: {
  employeuses: EmployeuseAffichee[]
  trouvees: number
  parPage: number
  state: DataTableUrlState
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      tableClassName="fr-table--transparent"
    >
      <EmployeusesTableHead state={state} baseHref={baseHref} />
      <tbody>
        {employeuses.map((employeuse) => (
          <EmployeuseTableRow
            key={employeuse.id}
            employeuse={employeuse}
            baseHref={baseHref}
          />
        ))}
        {employeuses.length === 0 && <AucunResultat />}
      </tbody>
    </DataTable>
    <EmployeusesPagination
      state={state}
      baseHref={baseHref}
      trouvees={trouvees}
      parPage={parPage}
    />
  </>
)

export default EmployeusesTable
