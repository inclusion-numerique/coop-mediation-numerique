import { rechercherDesCommunes } from '@/libraries/ban'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components'
import type { OptionsData } from '@/libraries/ui/primitives'
import type { CommuneDuCra } from '../commune-du-cra.validation'

const loadSuggestions = async (
  texte: string,
): Promise<{ items: CommuneDuCra[] }> => ({
  items: [...(await rechercherDesCommunes(texte))],
})

const itemToString = (item: CommuneDuCra | null): string => item?.label ?? ''

const itemToKey = (item: CommuneDuCra): string => item.id

const renderItem = ({ item }: { item: CommuneDuCra }) => itemToString(item)

export const CommuneComboBox: ComboBoxData<CommuneDuCra> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const CommuneOptions: OptionsData<CommuneDuCra> = {
  itemToKey,
  renderItem,
}
