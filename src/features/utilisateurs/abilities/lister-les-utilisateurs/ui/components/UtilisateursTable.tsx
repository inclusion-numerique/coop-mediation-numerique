import type { LigneUtilisateur } from '@/features/utilisateurs/domain'
import { DataTable, type DataTableUrlState } from '@/libraries/data-table'
import { colonnesDesUtilisateurs } from './colonnes-des-utilisateurs'
import { UtilisateursTableHead } from './UtilisateursTableHead'
import { UtilisateurTableRow } from './UtilisateurTableRow'

const AucunResultat = () => (
  <tr>
    <td colSpan={colonnesDesUtilisateurs.length}>Aucun résultat</td>
  </tr>
)

export const UtilisateursTable = ({
  utilisateurs,
  state,
  baseHref,
}: {
  utilisateurs: readonly LigneUtilisateur[]
  state: DataTableUrlState
  baseHref: string
}) => (
  <DataTable
    className="fr-table--nowrap fr-width-full fr-mb-8v"
    tableClassName="fr-table--transparent"
  >
    <UtilisateursTableHead state={state} baseHref={baseHref} />
    <tbody>
      {utilisateurs.map((utilisateur) => (
        <UtilisateurTableRow key={utilisateur.id} utilisateur={utilisateur} />
      ))}
      {utilisateurs.length === 0 && <AucunResultat />}
    </tbody>
  </DataTable>
)
