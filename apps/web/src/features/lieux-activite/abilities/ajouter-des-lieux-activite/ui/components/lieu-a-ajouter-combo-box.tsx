import type { OptionsData } from '@app/ui/components/Primitives/Options'
import { rechercherDesLieuxAAjouterAction } from '@app/web/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import type { SuggestionDeLieu } from '@app/web/features/lieux-activite/domain/suggestion-de-lieu'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

const itemToString = (item: SuggestionDeLieu | null): string =>
  item ? item.nom : ''

const itemToKey = (item: SuggestionDeLieu): string => item.id

export const rechercheMinimum = 3

export type RechercheLieuAAjouter = {
  recherche: string
  enCours: boolean
  enEchec: boolean
  nonAffiches: number
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: SuggestionDeLieu[] } & RechercheLieuAAjouter> => {
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

const renderItem = ({ item }: { item: SuggestionDeLieu }) => (
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
  SuggestionDeLieu,
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

export const LieuAAjouterOptions: OptionsData<SuggestionDeLieu> = {
  itemToKey,
  renderItem,
}
