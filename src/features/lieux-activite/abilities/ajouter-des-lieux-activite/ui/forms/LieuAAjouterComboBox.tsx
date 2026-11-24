import {
  type SuggestionAffichee,
  suggestionsAffichees,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/presenters/suggestion-de-lieu.presenter'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { inject } from '@/libraries/nextjs/injection/client'
import type { OptionsData } from '@/libraries/ui/primitives/Options'
import { RECHERCHER_DES_LIEUX_KEY } from '../../action/rechercher-des-lieux.key'

const itemToString = (item: SuggestionAffichee | null): string =>
  item ? item.nom : ''

const itemToKey = (item: SuggestionAffichee): string => item.id

export const rechercheMinimum = 3

export type RechercheLieuAAjouter = {
  recherche: string
  enCours: boolean
  enEchec: boolean
  nonAffiches: number
}

const loadSuggestions = async (
  input: string,
): Promise<{ items: SuggestionAffichee[] } & RechercheLieuAAjouter> => {
  const rien = { items: [], recherche: input, enCours: false, nonAffiches: 0 }

  if (input.length < rechercheMinimum) return { ...rien, enEchec: false }

  const resultat = await inject(RECHERCHER_DES_LIEUX_KEY)({ recherche: input })

  if (!resultat.success) return { ...rien, enEchec: true }

  const { structures, matchesCount } = suggestionsAffichees(resultat.data)

  return {
    items: [...structures],
    recherche: input,
    enCours: false,
    enEchec: false,
    nonAffiches: matchesCount - structures.length,
  }
}

const renderItem = ({ item }: { item: SuggestionAffichee }) => (
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
  SuggestionAffichee,
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

export const LieuAAjouterOptions: OptionsData<SuggestionAffichee> = {
  itemToKey,
  renderItem,
}
