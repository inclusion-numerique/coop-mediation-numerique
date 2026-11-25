import type { LigneUtilisateur } from '@/features/utilisateurs/domain'
import { DataTable } from '@/libraries/data-table/table'
import { colonnesDesUtilisateurs } from '../columns/utilisateurs.columns'
import type { LiensDeLaListe } from '../presenters/liste-des-utilisateurs.presenter'
import { UtilisateursTableHead } from './UtilisateursTableHead'
import { UtilisateurTableRow } from './UtilisateurTableRow'

const AucunResultat = () => (
  <tr>
    <td colSpan={colonnesDesUtilisateurs.length}>Aucun résultat</td>
  </tr>
)

export const UtilisateursTable = ({
  utilisateurs,
  colonnes,
}: {
  utilisateurs: readonly LigneUtilisateur[]
  colonnes: LiensDeLaListe['colonnes']
}) => (
  <DataTable
    className="fr-table--nowrap fr-width-full fr-mb-8v"
    tableClassName="fr-table--transparent"
  >
    <UtilisateursTableHead colonnes={colonnes} />
    <tbody>
      {utilisateurs.map((utilisateur) => (
        <UtilisateurTableRow key={utilisateur.id} utilisateur={utilisateur} />
      ))}
      {utilisateurs.length === 0 && <AucunResultat />}
    </tbody>
  </DataTable>
)
