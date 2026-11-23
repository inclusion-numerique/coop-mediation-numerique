import {
  type DataTableUrlState,
  SortableColumnHeader,
} from '@/libraries/data-table'
import { TRI_PAR_DEFAUT } from '../../domain'
import { colonnesDesUtilisateurs } from './utilisateurs.columns'

export const UtilisateursTableHead = ({
  state,
  baseHref,
}: {
  state: DataTableUrlState
  baseHref: string
}) => (
  <thead>
    <tr>
      {colonnesDesUtilisateurs.map(({ cle, libelle, tri }) =>
        tri ? (
          <SortableColumnHeader
            key={cle}
            label={libelle}
            tri={tri}
            state={state}
            baseHref={baseHref}
            isDefault={tri === TRI_PAR_DEFAUT.colonne}
            defaultDirection={TRI_PAR_DEFAUT.ordre}
          />
        ) : (
          <th key={cle} scope="col">
            {libelle}
          </th>
        ),
      )}
      <th className="fr-sr-only">Fiche utilisateur</th>
    </tr>
  </thead>
)
