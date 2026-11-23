import {
  type DataTableUrlState,
  SortableColumnHeader,
} from '@/libraries/data-table'
import type { ColonneTriable } from '../presenters/lister-tous-les-lieux-search-params'

const EnTeteTriable = ({
  label,
  tri,
  state,
  baseHref,
  isDefault,
}: {
  label: string
  tri: ColonneTriable
  state: DataTableUrlState
  baseHref: string
  isDefault?: boolean
}) => (
  <SortableColumnHeader
    label={label}
    tri={tri}
    state={state}
    baseHref={baseHref}
    isDefault={isDefault}
  />
)

export const LieuxTableHead = ({
  state,
  baseHref,
}: {
  state: DataTableUrlState
  baseHref: string
}) => (
  <thead>
    <tr>
      <EnTeteTriable
        label="Nom"
        tri="nom"
        state={state}
        baseHref={baseHref}
        isDefault
      />
      <th scope="col">Type</th>
      <th scope="col">Adresse</th>
      <th scope="col">SIRET</th>
      <th scope="col">Typologies</th>
      <th scope="col">Visible carto</th>
      <EnTeteTriable
        label="Création"
        tri="creation"
        state={state}
        baseHref={baseHref}
      />
      <EnTeteTriable
        label="Modification"
        tri="modification"
        state={state}
        baseHref={baseHref}
      />
      <EnTeteTriable
        label="Médiateurs en activité"
        tri="mediateursEnActivite"
        state={state}
        baseHref={baseHref}
      />
      <th className="fr-sr-only">Modifier le lieu</th>
    </tr>
  </thead>
)
