import { SortableColumnHeader } from '@/libraries/data-table'
import type { EtatDeLaListe } from '../presenters/etat-de-la-liste.search-params'

export const EquipeTableHead = ({
  state,
  baseHref,
  avecActions,
}: {
  state: EtatDeLaListe
  baseHref: string
  avecActions: boolean
}) => (
  <thead>
    <tr>
      <th scope="col" />
      <SortableColumnHeader
        label="Membre"
        tri="membre"
        state={state}
        baseHref={baseHref}
      />
      <th scope="col">Adresse email</th>
      <SortableColumnHeader
        label="Structure employeuse"
        tri="structureEmployeuse"
        state={state}
        baseHref={baseHref}
      />
      <SortableColumnHeader
        label="Statut"
        tri="statut"
        state={state}
        baseHref={baseHref}
        isDefault
      />
      {avecActions && <th scope="col" />}
      <th scope="col" className="fr-sr-only">
        Profil du membre
      </th>
    </tr>
  </thead>
)
