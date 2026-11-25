import { DataTable } from '@/libraries/data-table/table'
import { PiedDeListe } from '@/libraries/etat-d-url/liste'
import { employeusesColumns } from '../columns/employeuses.columns'
import { paginationDesEmployeuses } from '../filtres/liste-des-employeuses.filtre'
import type { BarreDesEmployeuses } from '../presenters/barre-des-employeuses.presenter'
import type { EmployeuseAffichee } from '../presenters/employeuse-affichee.presenter'
import { EmployeusesTableHead } from './EmployeusesTableHead'
import { EmployeuseTableRow } from './EmployeuseTableRow'

const AucunResultat = () => (
  <tr>
    <td colSpan={employeusesColumns.length + 1}>Aucun résultat</td>
  </tr>
)

const EmployeusesTable = ({
  employeuses,
  barre,
  baseHref,
}: {
  employeuses: EmployeuseAffichee[]
  barre: BarreDesEmployeuses
  baseHref: string
}) => (
  <>
    <DataTable
      className="fr-table--nowrap fr-width-full fr-mb-8v"
      tableClassName="fr-table--transparent"
    >
      <EmployeusesTableHead colonnes={barre.colonnes} />
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
    <PiedDeListe liens={barre.pages} pagination={paginationDesEmployeuses} />
  </>
)

export default EmployeusesTable
