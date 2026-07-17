import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import { vanillaTrpc } from '@app/web/trpc'

/**
 * Recherche d'un lieu d'activité, par ordre de priorité : les lieux déjà connus
 * de la coop, puis ceux de la cartographie nationale que la coop ne connaît pas
 * encore, et en dernier repli l'annuaire des entreprises. Cette priorité évite de
 * recréer un lieu qui existe déjà.
 */
const itemToString = (item: LieuActiviteSearchResult | null): string =>
  item ? item.nom : ''

const itemToKey = (item: LieuActiviteSearchResult): string => item.id

const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActiviteSearchResult[] }> => {
  if (input.length < 3) return { items: [] }

  const result = await vanillaTrpc.structures.searchLieuActiviteCombined.query({
    query: input,
  })

  return { items: result.structures }
}

const origines: Record<LieuActiviteSearchResult['source'], string> = {
  structure_locale: 'Déjà dans vos lieux',
  cartographie_nationale: 'Cartographie nationale',
  api: 'Annuaire des entreprises',
}

const renderItem = ({ item }: { item: LieuActiviteSearchResult }) => (
  <div className="fr-flex fr-direction-column">
    <span className="fr-text--bold">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.adresse}
      {item.adresse && (item.codePostal || item.commune) ? ', ' : null}
      {item.codePostal} {item.commune}
    </span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {origines[item.source]}
    </span>
  </div>
)

export const LieuActiviteComboBox: ComboBoxData<LieuActiviteSearchResult> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const LieuActiviteOptions: OptionsData<LieuActiviteSearchResult> = {
  itemToKey,
  renderItem,
}
