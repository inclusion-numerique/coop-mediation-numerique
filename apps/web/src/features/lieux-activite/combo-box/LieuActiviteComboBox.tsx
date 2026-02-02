import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

type LieuActivite = {
  id: string
  nom: string
  adresse: string
  mostUsed: boolean
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActivite[] }> => {
  const data = await vanillaTrpc.lieuActivite.search.query({
    query: input,
  })

  return {
    items: data.map((structure) => ({
      id: structure.value,
      nom: structure.extra.nom,
      adresse: structure.extra.adresse,
      mostUsed: structure.extra.mostUsed,
    })),
  }
}

const itemToString = (item: LieuActivite | null): string =>
  item == null ? '' : item.nom

const itemToKey = (item: LieuActivite): string => item.id

const renderItem = ({
  item,
  isSelected,
}: {
  item: LieuActivite
  isSelected: boolean
}) => (
  <span className="fr-flex fr-flex-gap-2v fr-align-items-center">
    {item.mostUsed && (
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

export const LieuActiviteComboBox: ComboBoxData<LieuActivite> = {
  itemToString,
  loadSuggestions,
  itemToKey,
}

export const LieuActiviteOptions: OptionsData<LieuActivite> = {
  itemToKey,
  renderItem,
}
