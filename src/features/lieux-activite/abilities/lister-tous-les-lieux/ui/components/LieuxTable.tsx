import { DataTable, type DataTableUrlState } from '@/libraries/data-table'
import type { LigneDeLaListe } from '../../domain/ligne-de-la-liste'
import { LieuTableRow } from './LieuTableRow'
import { LieuxTableHead } from './LieuxTableHead'

const NOMBRE_DE_COLONNES = 10

export const LieuxTable = ({
  lignes,
  state,
  baseHref,
}: {
  lignes: readonly LigneDeLaListe[]
  state: DataTableUrlState
  baseHref: string
}) => (
  <DataTable
    className="fr-table--nowrap fr-width-full fr-mb-8v"
    tableClassName="fr-table--transparent"
  >
    <LieuxTableHead state={state} baseHref={baseHref} />
    <tbody>
      {lignes.map((ligne) => (
        <LieuTableRow key={ligne.id} ligne={ligne} />
      ))}
      {lignes.length === 0 && (
        <tr>
          <td colSpan={NOMBRE_DE_COLONNES}>Aucun résultat</td>
        </tr>
      )}
    </tbody>
  </DataTable>
)
