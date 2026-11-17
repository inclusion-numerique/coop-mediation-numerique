import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import { NombreDeLieux } from '../../../domain/nombres'
import { SourceExterne } from '../../../domain/source-externe'
import {
  connueDeLaCoop,
  type SuggestionsDeLieux,
} from '../../../domain/suggestion-de-lieu'
import type {
  RechercherDesLieuxAAjouterPorts,
  SuggestionsDUneSource,
} from './ports'
import type { RechercheDeLieu } from './recherche-de-lieu'
import type { TermeDeRecherche } from './terme-de-recherche'

type OptionsDeRecherche = {
  readonly limite: NombreDeLieux
  readonly sauf: readonly IdentifiantCartographie[]
}

const LIMITE_PAR_DEFAUT = NombreDeLieux(50)

const AUCUNE_SUGGESTION: SuggestionsDeLieux = {
  suggestions: [],
  nombre: NombreDeLieux(0),
  sourcesEnPanne: [],
}

const sansPanne = (reponse: SuggestionsDUneSource): SuggestionsDeLieux => ({
  ...reponse,
  sourcesEnPanne: [],
})

const enPanne = (source: SourceExterne): SuggestionsDeLieux => ({
  ...AUCUNE_SUGGESTION,
  sourcesEnPanne: [source],
})

const interroger = (
  source: SourceExterne,
  appel: Promise<SuggestionsDUneSource>,
): Promise<SuggestionsDeLieux> => appel.then(sansPanne, () => enPanne(source))

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
  ({ chercherDansLaCoop }: RechercherDesLieuxAAjouterPorts) =>
  (terme: TermeDeRecherche, { limite }: OptionsDeRecherche) =>
    chercherDansLaCoop(terme, limite).then(sansPanne)

const dansLaCoopEtLaCartographie =
  (ports: RechercherDesLieuxAAjouterPorts) =>
  async (
    terme: TermeDeRecherche,
    { limite, sauf }: OptionsDeRecherche,
  ): Promise<SuggestionsDeLieux> => {
    const [coop, cartographie] = await Promise.all([
      dansLaCoop(ports)(terme, { limite: moitie(limite), sauf }),
      interroger(
        SourceExterne('Cartographie'),
        ports.chercherDansLaCartographie(terme, {
          limite: moitie(limite),
          sauf,
        }),
      ),
    ])

    return reunies(coop, inconnuesDeLaCoop(cartographie))
  }

const sourcesPrioritaires = {
  ParNumeroDEntreprise: dansLaCoop,
  ParNom: dansLaCoopEtLaCartographie,
}

const sinonDansLAnnuaire =
  ({ chercherDansLAnnuaireDesEntreprises }: RechercherDesLieuxAAjouterPorts) =>
  async (
    terme: TermeDeRecherche,
    trouvees: SuggestionsDeLieux,
  ): Promise<SuggestionsDeLieux> => {
    if (trouvees.suggestions.length > 0) return trouvees

    const annuaire = await interroger(
      SourceExterne('Annuaire'),
      chercherDansLAnnuaireDesEntreprises(terme),
    )

    return {
      ...annuaire,
      sourcesEnPanne: [...trouvees.sourcesEnPanne, ...annuaire.sourcesEnPanne],
    }
  }

export const rechercherDesLieuxAAjouter =
  (ports: RechercherDesLieuxAAjouterPorts) =>
  async (
    recherche: RechercheDeLieu,
    { limite = LIMITE_PAR_DEFAUT, sauf = [] }: Partial<OptionsDeRecherche> = {},
  ): Promise<SuggestionsDeLieux> => {
    if (recherche._tag === 'TropCourte') return AUCUNE_SUGGESTION

    const prioritaires = await sourcesPrioritaires[recherche._tag](ports)(
      recherche.terme,
      { limite, sauf },
    )

    return auPlus(limite)(
      await sinonDansLAnnuaire(ports)(recherche.terme, prioritaires),
    )
  }
