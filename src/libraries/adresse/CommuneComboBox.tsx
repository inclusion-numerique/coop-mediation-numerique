import {
  type Commune,
  rechercherDesCommunes,
} from '@/libraries/ban/rechercher-des-communes'
import { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { OptionsData } from '@/libraries/ui/primitives/Options'

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
