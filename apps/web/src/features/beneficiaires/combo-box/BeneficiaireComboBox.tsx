import { OptionsData } from '@app/ui/components/Primitives/Options'
import { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

type Beneficiaire = {
  id: string
  prenom: string
  nom: string
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: Beneficiaire[] }> => {
  const data = await vanillaTrpc.beneficiaires.search.query({
    query: input,
  })

  return Promise.resolve({
    items: data.beneficiaires.map(({ id, prenom, nom }) => ({
      id,
      prenom,
      nom,
    })),
  })
}

const itemToString = (item: Beneficiaire | null): string =>
  item?.prenom == null || item?.nom == null ? '' : `${item.prenom} ${item.nom}`

const itemToKey = (item: Beneficiaire): string => item.id

const renderItem = ({ item }: { item: Beneficiaire }) => (
  <>
    {item.prenom} {item.nom}
  </>
)

export const BeneficiaireComboBox: ComboBoxData<Beneficiaire> = {
  itemToString,
  loadSuggestions,
  itemToKey,
}

export const BeneficiaireOptions: OptionsData<Beneficiaire> = {
  itemToKey,
  renderItem,
}

export const BeneficiaireSelectedItems: SelectedItemsData<Beneficiaire> = {
  itemToString,
  itemToKey,
}
