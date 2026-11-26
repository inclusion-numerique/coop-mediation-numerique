import { type Result, success } from '@/libraries/result'
import type { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { NombreDeLieux } from '../../../domain/nombres'
import {
  connueDeLaCoop,
  type SuggestionsDeLieux,
} from '../../../domain/suggestion-de-lieu'
import type {
  EchecDeRechercherDesLieuxAAjouter,
  SourceIndisponible,
} from './errors'
import type {
  ChercherDansLAnnuaireDesEntreprises,
  ChercherDansLaCoop,
  RechercherDesLieuxAAjouterPorts,
  SuggestionsDUneSource,
} from './ports'
import type { RechercheDeLieu } from './recherche-de-lieu'
import type { TermeDeRecherche } from './terme-de-recherche'

type OptionsDeRecherche = {
  readonly limite: NombreDeLieux
  readonly sauf: readonly IdentifiantCartographie[]
}

export const LIMITE_DES_SUGGESTIONS = NombreDeLieux(50)

const AUCUNE_SUGGESTION: SuggestionsDeLieux = {
  suggestions: [],
  nombre: NombreDeLieux(0),
  sourcesEnPanne: [],
}

const sansPanne = (reponse: SuggestionsDUneSource): SuggestionsDeLieux => ({
  ...reponse,
  sourcesEnPanne: [],
})

const reponseDe = (
  reponse: Result<SuggestionsDUneSource, SourceIndisponible>,
): SuggestionsDeLieux =>
  reponse.success
    ? sansPanne(reponse.data)
    : { ...AUCUNE_SUGGESTION, sourcesEnPanne: [reponse.error.source] }

const reunies = (
  premieres: SuggestionsDeLieux,
  suivantes: SuggestionsDeLieux,
): SuggestionsDeLieux => ({
  suggestions: [...premieres.suggestions, ...suivantes.suggestions],
  nombre: NombreDeLieux(premieres.nombre + suivantes.nombre),
  sourcesEnPanne: [...premieres.sourcesEnPanne, ...suivantes.sourcesEnPanne],
})

const inconnuesDeLaCoop = (
  trouvees: SuggestionsDeLieux,
): SuggestionsDeLieux => ({
  ...trouvees,
  suggestions: trouvees.suggestions.filter(
    (suggestion) => !connueDeLaCoop(suggestion),
  ),
})

const auPlus =
  (limite: NombreDeLieux) =>
  (trouvees: SuggestionsDeLieux): SuggestionsDeLieux => ({
    ...trouvees,
    suggestions: trouvees.suggestions.slice(0, limite),
  })

const moitie = (limite: NombreDeLieux): NombreDeLieux =>
  NombreDeLieux(Math.ceil(limite / 2))

const dansLaCoop =
  (chercherDansLaCoop: ChercherDansLaCoop) =>
  async (
    terme: TermeDeRecherche,
    limite: NombreDeLieux,
  ): Promise<SuggestionsDeLieux> =>
    sansPanne(await chercherDansLaCoop(terme, limite))

const dansLaCoopEtLaCartographie =
  ({
    chercherDansLaCoop,
    chercherDansLaCartographie,
  }: RechercherDesLieuxAAjouterPorts) =>
  async (
    terme: TermeDeRecherche,
    { limite, sauf }: OptionsDeRecherche,
  ): Promise<SuggestionsDeLieux> => {
    const [coop, cartographie] = await Promise.all([
      dansLaCoop(chercherDansLaCoop)(terme, moitie(limite)),
      chercherDansLaCartographie(terme, { limite: moitie(limite), sauf }),
    ])

    return reunies(coop, inconnuesDeLaCoop(reponseDe(cartographie)))
  }

const dansLaCoopSeulement =
  ({ chercherDansLaCoop }: RechercherDesLieuxAAjouterPorts) =>
  (
    terme: TermeDeRecherche,
    { limite }: OptionsDeRecherche,
  ): Promise<SuggestionsDeLieux> =>
    dansLaCoop(chercherDansLaCoop)(terme, limite)

const sourcesPrioritaires = {
  ParNumeroDEntreprise: dansLaCoopSeulement,
  ParNom: dansLaCoopEtLaCartographie,
}

const sinonDansLAnnuaire =
  (chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises) =>
  async (
    terme: TermeDeRecherche,
    trouvees: SuggestionsDeLieux,
  ): Promise<SuggestionsDeLieux> => {
    if (trouvees.suggestions.length > 0) return trouvees

    const annuaire = reponseDe(await chercherDansLAnnuaireDesEntreprises(terme))

    return {
      ...annuaire,
      sourcesEnPanne: [...trouvees.sourcesEnPanne, ...annuaire.sourcesEnPanne],
    }
  }

export const rechercherDesLieuxAAjouter =
  ({
    chercherDansLaCoop,
    chercherDansLaCartographie,
    chercherDansLAnnuaireDesEntreprises,
  }: RechercherDesLieuxAAjouterPorts) =>
  async ({
    recherche,
    limite,
    sauf,
  }: {
    readonly recherche: RechercheDeLieu
    readonly limite: NombreDeLieux
    readonly sauf: readonly IdentifiantCartographie[]
  }): Promise<
    Result<SuggestionsDeLieux, EchecDeRechercherDesLieuxAAjouter>
  > => {
    if (recherche._tag === 'TropCourte') return success(AUCUNE_SUGGESTION)

    const prioritaires = await sourcesPrioritaires[recherche._tag]({
      chercherDansLaCoop,
      chercherDansLaCartographie,
      chercherDansLAnnuaireDesEntreprises,
    })(recherche.terme, { limite, sauf })

    return success(
      auPlus(limite)(
        await sinonDansLAnnuaire(chercherDansLAnnuaireDesEntreprises)(
          recherche.terme,
          prioritaires,
        ),
      ),
    )
  }
