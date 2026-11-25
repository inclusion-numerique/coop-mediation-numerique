import { DataTable } from '@/libraries/data-table/table'
import type { LigneDeLaListe } from '../../domain/ligne-de-la-liste'
import type { LiensDeLaListe } from '../filtres/liste-des-lieux.filtre'
import { LieuTableRow } from './LieuTableRow'
import { LieuxTableHead } from './LieuxTableHead'

const NOMBRE_DE_COLONNES = 10

export const LieuxTable = ({
  lignes,
  colonnes,
}: {
  lignes: readonly LigneDeLaListe[]
  colonnes: LiensDeLaListe['colonnes']
}) => (
  <DataTable
    className="fr-table--nowrap fr-width-full fr-mb-8v"
    tableClassName="fr-table--transparent"
  >
    <LieuxTableHead colonnes={colonnes} />
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
