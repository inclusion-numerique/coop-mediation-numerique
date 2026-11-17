import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { inject } from '@app/web/libs/injection/client'
import type { CommuneDuCra } from './commune-du-cra'
import { RECHERCHER_DES_COMMUNES_DU_CRA_KEY } from './rechercher-des-communes.key'

const loadSuggestions = async (
  texte: string,
): Promise<{ items: CommuneDuCra[] }> => ({
  items: [...(await inject(RECHERCHER_DES_COMMUNES_DU_CRA_KEY)(texte))],
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
