import { searchAdresses } from '@app/web/external-apis/apiAdresse'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { OptionsData } from '@app/web/libs/ui/primitives/Options'

type Commune = {
  id: string
  label: string
  city: string
  postcode: string
  citycode: string
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: Commune[] }> => {
  const adresses = await searchAdresses(input, {
    limit: 10,
    autocomplete: true,
    type: 'municipality',
  })

  return {
    items: adresses.map((adresse) => ({
      id: adresse.properties.id,
      label: `${adresse.properties.label} · ${adresse.properties.postcode}`,
      city: adresse.properties.city,
      postcode: adresse.properties.postcode,
      citycode: adresse.properties.citycode,
    })),
  }
}

const itemToString = (item: Commune | null): string =>
  item == null ? '' : item.label

const itemToKey = (item: Commune): string => item.id

const renderItem = ({ item }: { item: Commune }) => (
  <span>{itemToString(item)}</span>
)

export const CommuneComboBox: ComboBoxData<Commune> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const CommuneOptions: OptionsData<Commune> = {
  itemToKey,
  renderItem,
}
