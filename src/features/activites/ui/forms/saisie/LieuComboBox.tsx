import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { inject } from '@/libraries/nextjs/injection/client'
import type { OptionsData } from '@/libraries/ui/components/primitives/Options'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '../../../action/rechercher-des-lieux.key'
import {
  type LieuDuCra,
  lieuDuCra,
} from '../../presenters/saisie/lieu-du-cra.presenter'

const loadSuggestions = async (
  recherche: string,
): Promise<{ items: LieuDuCra[] }> => {
  const resultat = await inject(RECHERCHER_DES_LIEUX_DU_CRA_KEY)({ recherche })
  return { items: resultat.success ? resultat.data.map(lieuDuCra) : [] }
}

const itemToString = (item: LieuDuCra | null): string => item?.nom ?? ''

const itemToKey = (item: LieuDuCra): string => item.id

const renderItem = ({
  item,
  isSelected,
}: {
  item: LieuDuCra
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

export const LieuComboBox: ComboBoxData<LieuDuCra> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const LieuOptions: OptionsData<LieuDuCra> = {
  itemToKey,
  renderItem,
}
