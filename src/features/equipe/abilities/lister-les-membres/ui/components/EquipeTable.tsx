import type { ReactNode } from 'react'
import { DataTable } from '@/libraries/data-table'
import type { LigneEquipe } from '../../../../domain'
import type { EtatDeLaListe } from '../presenters/etat-de-la-liste.search-params'
import type { LigneAffichee } from '../presenters/lister-les-membres.presenter'
import { EquipeTableHead } from './EquipeTableHead'
import { EquipeTableRow } from './EquipeTableRow'

const AucunResultat = ({ colonnes }: { colonnes: number }) => (
  <tr>
    <td colSpan={colonnes}>Aucun résultat</td>
  </tr>
)

export const EquipeTable = ({
  lignes,
  state,
  baseHref,
  actions,
}: {
  lignes: readonly LigneAffichee[]
  state: EtatDeLaListe
  baseHref: string
  actions: ((ligne: LigneEquipe) => ReactNode) | null
}) => (
  <DataTable className="fr-table--nowrap fr-width-full">
    <EquipeTableHead
      state={state}
      baseHref={baseHref}
      avecActions={actions !== null}
    />
    <tbody>
      {lignes.map((ligne) => (
        <EquipeTableRow key={ligne.cle} ligne={ligne} actions={actions} />
      ))}
      {lignes.length === 0 && (
        <AucunResultat colonnes={actions === null ? 6 : 7} />
      )}
    </tbody>
  </DataTable>
)
