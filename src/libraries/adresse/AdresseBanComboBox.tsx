import type { AdresseBanData } from '@/libraries/adresse/AdresseBanValidation'
import { searchAdresses, siIndisponible } from '@/libraries/ban/apiAdresse'
import { banFeatureToAdresseBanData } from '@/libraries/ban/banFeatureToAdresseBanData'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'

const loadSuggestions = async (
  input: string,
): Promise<{ items: AdresseBanData[] }> => {
  if (input.trim().length < 3) {
    return { items: [] }
  }

  const adresses = await searchAdresses(input, {
    limit: 10,
    autocomplete: true,
  }).catch(siIndisponible([]))

  return { items: adresses.map(banFeatureToAdresseBanData) }
}

const itemToString = (item: AdresseBanData | null): string => item?.label ?? ''

const itemToKey = (item: AdresseBanData): string => item.id

const renderItem = ({ item }: { item: AdresseBanData }) => (
  <div className="fr-flex fr-direction-column">
    <span>{item.label}</span>
  </div>
)

export const AdresseBanComboBox: ComboBoxData<AdresseBanData> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const AdresseBanOptions: OptionsData<AdresseBanData> = {
  itemToKey,
  renderItem,
}
