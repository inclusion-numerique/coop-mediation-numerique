import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'
import type { LieuActiviteTrouve } from '../implementation'

/**
 * Le chargement des suggestions passe encore par tRPC : c'est le transport que
 * les combo-box de la coop utilisent toutes, y compris celles des abilities
 * déjà migrées. La procédure n'est plus qu'un adaptateur sur cette ability.
 */
const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActiviteTrouve[] }> => ({
  items: [...(await vanillaTrpc.lieuActivite.search.query({ query: input }))],
})

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
