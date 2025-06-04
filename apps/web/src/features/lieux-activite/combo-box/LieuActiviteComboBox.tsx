import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { OptionsData } from '@app/web/libs/ui/primitives/Options'
import { vanillaTrpc } from '@app/web/trpc'

type LieuActivite = {
  id: string
  nom: string
  adresse: string
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActivite[] }> => {
  const data = await vanillaTrpc.lieuActivite.search.query({
    query: input,
  })

  return Promise.resolve({
    items: data.lieuxActivite.map((lieu) => ({
      id: lieu.id,
      nom: lieu.structure.nom,
      adresse: `${lieu.structure.adresse} ${lieu.structure.commune} ${lieu.structure.codePostal}`,
    })),
  })
}

const itemToString = (item: LieuActivite | null): string =>
  item == null ? '' : item.nom

const itemToKey = (item: LieuActivite): string => item.id

const renderItem = ({ item }: { item: LieuActivite }) => (
  <span className="fr-flex fr-direction-column">
    <span>{item.nom}</span>
    <span className="fr-text-mention--grey fr-text--sm">{item.adresse}</span>
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
