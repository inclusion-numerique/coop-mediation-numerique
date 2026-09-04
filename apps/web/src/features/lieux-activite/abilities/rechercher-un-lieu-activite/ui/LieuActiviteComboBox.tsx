import { OptionsData } from '@app/ui/components/Primitives/Options'
import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import type { LieuActiviteTrouve } from '../implementation'

const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActiviteTrouve[] }> => {
  const resultat = await rechercherUnLieuActiviteAction({ recherche: input })

  // Une recherche qui échoue ne propose rien : le champ reste utilisable, et
  // l'utilisateur peut toujours saisir autre chose.
  return { items: resultat.success ? [...resultat.data] : [] }
}

const itemToString = (item: LieuActiviteTrouve | null): string =>
  item == null ? '' : item.nom

const itemToKey = (item: LieuActiviteTrouve): string => item.id

const renderItem = ({
  item,
  isSelected,
}: {
  item: LieuActiviteTrouve
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

export const LieuActiviteComboBox: ComboBoxData<LieuActiviteTrouve> = {
  itemToString,
  loadSuggestions,
  itemToKey,
}

export const LieuActiviteOptions: OptionsData<LieuActiviteTrouve> = {
  itemToKey,
  renderItem,
}
