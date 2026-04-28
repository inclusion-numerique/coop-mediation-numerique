import type { OptionsData } from '@app/ui/components/Primitives/Options'
import { searchAdresses } from '@app/web/external-apis/apiAdresse'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

const loadSuggestions = async (
  input: string,
): Promise<{ items: AdresseBanData[] }> => {
  if (input.trim().length < 3) {
    return { items: [] }
  }

  const adresses = await searchAdresses(input, {
    limit: 10,
    autocomplete: true,
  })

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
