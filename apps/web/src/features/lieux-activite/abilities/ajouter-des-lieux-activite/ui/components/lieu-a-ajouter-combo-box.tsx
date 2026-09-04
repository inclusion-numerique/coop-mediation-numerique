import type { OptionsData } from '@app/ui/components/Primitives/Options'
import { rechercherDesLieuxAAjouterAction } from '@app/web/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import type { LieuActiviteSearchResult } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

/**
 * Recherche d'un lieu à ajouter, par ordre de priorité : les lieux déjà connus
 * de la coop, puis ceux de la cartographie nationale qu'elle ne connaît pas
 * encore, et en dernier repli l'annuaire des entreprises. Cette priorité évite
 * de recréer un lieu qui existe déjà.
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
 *
 * `nonAffiches` compte ce que la recherche a trouvé sans le rendre : une liste
 * tronquée sans le dire laisserait croire que le lieu manquant n'existe pas.
 */
export type RechercheLieuAAjouter = {
  recherche: string
  enCours: boolean
  enEchec: boolean
  nonAffiches: number
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: LieuActiviteSearchResult[] } & RechercheLieuAAjouter> => {
  const rien = { items: [], recherche: input, enCours: false, nonAffiches: 0 }

  if (input.length < rechercheMinimum) return { ...rien, enEchec: false }

  const resultat = await rechercherDesLieuxAAjouterAction({ recherche: input })

  if (!resultat.success) return { ...rien, enEchec: true }

  const { structures, matchesCount } = resultat.data

  return {
    items: [...structures],
    recherche: input,
    enCours: false,
    enEchec: false,
    nonAffiches: matchesCount - structures.length,
  }
}

/**
 * Un lieu se désigne par sa dénomination et son adresse. La source dont il nous
 * parvient — la coop, la cartographie, l'annuaire des entreprises — ne dit rien
 * à qui cherche l'endroit où il travaille.
 */
const renderItem = ({ item }: { item: LieuActiviteSearchResult }) => (
  <div className="fr-flex fr-direction-column">
    <span className="fr-text--bold">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.typologie ? `${item.typologie} · ` : null}
      {item.adresse}
      {item.adresse && (item.codePostal || item.commune) ? ', ' : null}
      {item.codePostal} {item.commune}
    </span>
  </div>
)

export const LieuAAjouterComboBox: ComboBoxData<
  LieuActiviteSearchResult,
  RechercheLieuAAjouter
> = {
  itemToString,
  itemToKey,
  beforeLoadSuggestions: (input) => ({
    recherche: input,
    enCours: true,
    enEchec: false,
    nonAffiches: 0,
  }),
  loadSuggestions,
}

export const LieuAAjouterOptions: OptionsData<LieuActiviteSearchResult> = {
  itemToKey,
  renderItem,
}
