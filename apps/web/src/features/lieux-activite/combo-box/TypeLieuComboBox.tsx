import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

export type TypeLieuLabel = 'lieu' | 'commune' | 'departement'

export type TypeLieu = {
  label: string
  value: TypeLieuLabel
}

export const TYPE_LIEUX: TypeLieu[] = [
  { label: 'Lieu d’activité', value: 'lieu' },
  { label: 'Commune', value: 'commune' },
  { label: 'Département', value: 'departement' },
]

const loadSuggestions = async (): Promise<{ items: TypeLieu[] }> =>
  Promise.resolve({ items: TYPE_LIEUX })

const itemToString = (item: TypeLieu | null): string =>
  item == null ? '' : item.label

const itemToKey = (item: TypeLieu): string => item.value

const renderItem = ({ item }: { item: TypeLieu }) => item.label

export const TypeLieuComboBox: ComboBoxData<TypeLieu> = {
  itemToString,
  loadSuggestions,
  itemToKey,
}

export const TypeLieuOptions: OptionsData<TypeLieu> = {
  itemToKey,
  renderItem,
}
