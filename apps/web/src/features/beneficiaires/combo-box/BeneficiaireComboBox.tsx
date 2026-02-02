import { OptionsData } from '@app/ui/components/Primitives/Options'
import { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

type Beneficiaire = {
  id: string
  prenom: string
  nom: string
  communeResidence?: AdresseBanData | null
}

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (beneficiaire?: {
  id?: string
}): beneficiaire is { id: string } => beneficiaire?.id != null

const loadSuggestions =
  (selectedBeneficiaires: ({ id?: string } | undefined)[]) =>
  async (input: string): Promise<{ items: Beneficiaire[] }> => {
    const data = await vanillaTrpc.beneficiaires.search.query({
      query: input,
      excludeIds: selectedBeneficiaires.filter(onlyDefinedIds).map(itemToKey),
    })

    return Promise.resolve({
      items: data.beneficiaires.map(
        ({ id, prenom, nom, communeResidence }) => ({
          id,
          prenom,
          nom,
          communeResidence,
        }),
      ),
    })
  }

const itemToString = (item: Beneficiaire | null): string =>
  item?.prenom == null || item?.nom == null ? '' : `${item.prenom} ${item.nom}`

const renderItem = ({ item }: { item: Beneficiaire }) =>
  `${item.prenom} ${item.nom}`

export const BeneficiaireComboBox = (
  beneficiaires: ({ id?: string } | undefined)[] = [],
): ComboBoxData<Beneficiaire> => ({
  itemToString,
  loadSuggestions: loadSuggestions(beneficiaires),
  itemToKey,
})

export const BeneficiaireOptions: OptionsData<Beneficiaire> = {
  itemToKey,
  renderItem,
}

export const BeneficiaireSelectedItems: SelectedItemsData<Beneficiaire> = {
  itemToString,
  itemToKey,
}
