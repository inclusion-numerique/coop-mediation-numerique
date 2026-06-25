import { OptionsData } from '@app/ui/components/Primitives/Options'
import { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import { rechercherBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { toPreviewBanData } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/beneficiaire-option'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

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
    const result = await rechercherBeneficiairesAction({
      query: input,
      excludeIds: selectedBeneficiaires.filter(onlyDefinedIds).map(itemToKey),
    })

    if (!result.success) return { items: [] }

    return {
      items: result.data.beneficiaires.map(
        ({ id, prenom, nom, communeResidence }) => ({
          id,
          prenom,
          nom,
          communeResidence: communeResidence
            ? toPreviewBanData(communeResidence)
            : null,
        }),
      ),
    }
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
