import type { OptionsData } from '@app/ui/components/Primitives/Options'
import { rechercherUnLieuAFusionnerAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-a-fusionner.action'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

export type LieuChoisi = {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
}

const itemToString = (item: LieuChoisi | null): string => item?.nom ?? ''

const itemToKey = (item: LieuChoisi): string => item.id

export const rechercheMinimum = 3

export type RechercheDeFusion = {
  recherche: string
  enCours: boolean
  nonAffiches: number
}

export const lieuAFusionnerComboBox = (
  exclus: readonly string[],
): ComboBoxData<LieuChoisi, RechercheDeFusion> => ({
  itemToString,
  itemToKey,
  beforeLoadSuggestions: (input) => ({
    recherche: input,
    enCours: true,
    nonAffiches: 0,
  }),
  loadSuggestions: async (input) => {
    const rien = { items: [], recherche: input, enCours: false, nonAffiches: 0 }

    if (input.length < rechercheMinimum) return rien

    const resultat = await rechercherUnLieuAFusionnerAction({
      recherche: input,
    })

    if (!resultat.success) return rien

    const items = resultat.data.structures
      .filter(({ id }) => !exclus.includes(id))
      .map(({ id, nom, adresse, commune, codePostal }) => ({
        id,
        nom,
        adresse,
        commune,
        codePostal,
      }))

    return {
      items,
      recherche: input,
      enCours: false,
      nonAffiches: resultat.data.matchesCount - resultat.data.structures.length,
    }
  },
})

export const LieuAFusionnerOptions: OptionsData<LieuChoisi> = {
  itemToKey,
  renderItem: ({ item }) => (
    <div className="fr-flex fr-direction-column">
      <span className="fr-text--bold">{item.nom}</span>
      <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
        {item.adresse}, {item.codePostal} {item.commune}
      </span>
    </div>
  ),
}
