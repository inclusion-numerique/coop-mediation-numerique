import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { inject } from '@app/web/libs/injection/client'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '../action/rechercher-un-lieu-activite.key'
import {
  type OptionDeLieuTrouve,
  optionDeLieuTrouve,
} from './option-de-lieu-trouve.presenter'

const loadSuggestions = async (
  input: string,
): Promise<{ items: OptionDeLieuTrouve[] }> => {
  const resultat = await inject(RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY)({
    recherche: input,
  })

  return {
    items: resultat.success ? resultat.data.map(optionDeLieuTrouve) : [],
  }
}

const itemToString = (item: OptionDeLieuTrouve | null): string =>
  item == null ? '' : item.nom

const itemToKey = (item: OptionDeLieuTrouve): string => item.id

const renderItem = ({
  item,
  isSelected,
}: {
  item: OptionDeLieuTrouve
  isSelected: boolean
}) => (
  <span className="fr-flex fr-flex-gap-2v fr-align-items-center">
    {item.lePlusUtilise && (
      <span
        className="ri-star-line fr-text-label--blue-france"
        aria-hidden="true"
      />
    )}
    <span className="fr-flex fr-direction-column fr-flex-grow-1">
      {item.nom}
      <span className="fr-text-mention--grey fr-text--sm">{item.adresse}</span>
    </span>
    {isSelected && (
      <span
        className="fr-icon-check-line fr-text-label--blue-france"
        aria-hidden
      />
    )}
  </span>
)

export const LieuActiviteComboBox: ComboBoxData<OptionDeLieuTrouve> = {
  itemToString,
  loadSuggestions,
  itemToKey,
}

export const LieuActiviteOptions: OptionsData<OptionDeLieuTrouve> = {
  itemToKey,
  renderItem,
}
