import { OptionsData } from '@app/ui/components/Primitives/Options'
import { searchAdresses } from '@app/web/external-apis/apiAdresse'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

export type Commune = {
  id: string
  label: string
  commune: string
  codePostal: string
  codeInsee: string
  nom: string
  contexte: string
  latitude: number
  longitude: number
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
      commune: adresse.properties.city,
      codePostal: adresse.properties.postcode,
      codeInsee: adresse.properties.citycode,
      nom: adresse.properties.name,
      contexte: adresse.properties.context,
      latitude: adresse.geometry.coordinates[1],
      longitude: adresse.geometry.coordinates[0],
    })),
  }
}

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
