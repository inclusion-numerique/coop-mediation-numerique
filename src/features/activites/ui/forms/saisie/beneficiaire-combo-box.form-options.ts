import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { inject } from '@/libraries/nextjs/injection/client'
import type { OptionsData } from '@/libraries/ui/primitives/Options'
import type { SelectedItemsData } from '@/libraries/ui/primitives/SelectedItems'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '../../../action/rechercher-des-beneficiaires.key'
import {
  type BeneficiaireDuCra,
  beneficiaireDuCra,
} from '../../presenters/saisie/beneficiaire-du-cra.presenter'

const itemToKey = (item: { id: string }): string => item.id

const idsDefinis = (beneficiaire?: {
  id?: string | undefined
}): beneficiaire is {
  id: string
} => beneficiaire?.id != null

const loadSuggestions =
  (selectionnes: readonly ({ id?: string | undefined } | undefined)[]) =>
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
  selectionnes: readonly ({ id?: string | undefined } | undefined)[] = [],
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
