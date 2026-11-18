import {
  type DataTableUrlState,
  SortableColumnHeader,
} from '@/libraries/data-table'

export const EnTeteDuTableauDeMesActivites = ({
  state,
  baseHref,
}: {
  state: DataTableUrlState
  baseHref: string
}) => (
  <thead>
    <tr>
      <th scope="col">Activité</th>
      <SortableColumnHeader
        label="Date"
        tri="date"
        state={state}
        baseHref={baseHref}
        isDefault
        defaultDirection="desc"
      />
      <th scope="col">Durée</th>
      <th scope="col">Lieu d’activité</th>
      <th scope="col">Enregistrée le</th>
      <th className="fr-sr-only">Détail de l’activité</th>
    </tr>
  </thead>
)
