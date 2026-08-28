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

/** Longueur minimale à partir de laquelle la recherche interroge les annuaires. */
export const rechercheMinimum = 3

/**
 * L'état de la recherche voyage avec les résultats : sans lui, une liste vide
 * pendant le chargement serait indiscernable d'une recherche infructueuse — et
 * la proposition de créer un lieu clignoterait à chaque frappe. `enEchec`
 * distingue le troisième cas : une recherche qui n'a pas abouti ne prouve pas
 * que le lieu n'existe pas, et ne doit donc pas inviter à en créer un.
 */
export type RechercheLieuActivite = {
  recherche: string
  enCours: boolean
  enEchec: boolean
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActiviteSearchResult[] } & RechercheLieuActivite> => {
  const rien = { items: [], recherche: input, enCours: false }

  if (input.length < rechercheMinimum) return { ...rien, enEchec: false }

  try {
    const result =
      await vanillaTrpc.structures.searchLieuActiviteCombined.query({
        query: input,
      })

    return {
      items: result.structures,
      recherche: input,
      enCours: false,
      enEchec: false,
    }
  } catch {
    return { ...rien, enEchec: true }
  }
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

export const LieuActiviteComboBox: ComboBoxData<
  LieuActiviteSearchResult,
  RechercheLieuActivite
> = {
  itemToString,
  itemToKey,
  beforeLoadSuggestions: (input) => ({
    recherche: input,
    enCours: true,
    enEchec: false,
  }),
  loadSuggestions,
}

export const LieuActiviteOptions: OptionsData<LieuActiviteSearchResult> = {
  itemToKey,
  renderItem,
}
