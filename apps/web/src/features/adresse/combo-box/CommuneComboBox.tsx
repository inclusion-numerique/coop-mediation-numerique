import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import {
  type Commune,
  rechercherDesCommunes,
} from '../implementation/api-adresse/rechercher-des-communes'

export type { Commune }

const loadSuggestions = async (
  input: string,
): Promise<{ items: Commune[] }> => ({
  items: [...(await rechercherDesCommunes(input))],
})

const itemToString = (item: Commune | null): string =>
  item == null ? '' : item.label

const itemToKey = (item: Commune): string => item.id

const renderItem = ({ item }: { item: Commune }) => itemToString(item)

export const CommuneComboBox: ComboBoxData<Commune> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const CommuneOptions: OptionsData<Commune> = {
  itemToKey,
  renderItem,
}
