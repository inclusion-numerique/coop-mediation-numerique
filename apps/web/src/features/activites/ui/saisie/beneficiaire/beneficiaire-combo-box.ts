import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { inject } from '@app/web/libs/injection/client'
import {
  type BeneficiaireDuCra,
  beneficiaireDuCra,
} from './beneficiaire-du-cra'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from './rechercher-des-beneficiaires.key'

const itemToKey = (item: { id: string }): string => item.id

const idsDefinis = (beneficiaire?: {
  id?: string
}): beneficiaire is {
  id: string
} => beneficiaire?.id != null

const loadSuggestions =
  (selectionnes: readonly ({ id?: string } | undefined)[]) =>
  async (query: string): Promise<{ items: BeneficiaireDuCra[] }> => {
    const resultat = await inject(RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY)({
      query,
      excludeIds: selectionnes.filter(idsDefinis).map(itemToKey),
    })
    return {
      items: resultat.success
        ? resultat.data.beneficiaires.map(beneficiaireDuCra)
        : [],
    }
  }

const itemToString = (item: BeneficiaireDuCra | null): string =>
  item?.prenom == null || item?.nom == null ? '' : `${item.prenom} ${item.nom}`

const renderItem = ({ item }: { item: BeneficiaireDuCra }) =>
  `${item.prenom} ${item.nom}`

export const BeneficiaireComboBox = (
  selectionnes: readonly ({ id?: string } | undefined)[] = [],
): ComboBoxData<BeneficiaireDuCra> => ({
  itemToString,
  itemToKey,
  loadSuggestions: loadSuggestions(selectionnes),
})

export const BeneficiaireOptions: OptionsData<BeneficiaireDuCra> = {
  itemToKey,
  renderItem,
}

export const BeneficiaireSelectedItems: SelectedItemsData<BeneficiaireDuCra> = {
  itemToString,
  itemToKey,
}
