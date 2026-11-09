import type {
  SuggestionDeLieu,
  SuggestionsDeLieux,
} from '../../../domain/suggestion-de-lieu'
import type { RechercherDesLieuxAAjouterPorts } from './ports'

const LONGUEUR_MINIMALE = 3

const LIMITE_PAR_DEFAUT = 50

const aucuneSuggestion: SuggestionsDeLieux = {
  structures: [],
  matchesCount: 0,
  moreResults: 0,
  apiUnavailable: false,
  cartoUnavailable: false,
}

export const estUneRechercheParSiret = (recherche: string): boolean =>
  /^\d{9,14}$/.test(recherche.replace(/\s/g, ''))

const indisponible = {
  suggestions: [],
  nombre: 0,
  indisponible: true,
} as const

const tenterLaSource = <Resultat extends object>(appel: Promise<Resultat>) =>
  appel
    .then((resultat) => ({ ...resultat, indisponible: false }))
    .catch(() => indisponible)

const retenues = (
  suggestions: readonly SuggestionDeLieu[],
  nombre: number,
  limite: number,
) => {
  const structures = suggestions.slice(0, limite)
  return {
    structures,
    matchesCount: nombre,
    moreResults: Math.max(0, nombre - structures.length),
  }
}

const inconnueDeLaCoop = (suggestion: SuggestionDeLieu): boolean =>
  suggestion.structures.length === 0

export const rechercherDesLieuxAAjouter =
  ({
    chercherDansLaCoop,
    chercherDansLaCartographie,
    chercherDansLAnnuaireDesEntreprises,
  }: RechercherDesLieuxAAjouterPorts) =>
  async (
    recherche: string,
    {
      limite = LIMITE_PAR_DEFAUT,
      sauf = [],
    }: { readonly limite?: number; readonly sauf?: readonly string[] } = {},
  ): Promise<SuggestionsDeLieux> => {
    if (recherche.length < LONGUEUR_MINIMALE) return aucuneSuggestion

    const enDernierRecours = async (cartoUnavailable: boolean) => {
      const annuaire = await tenterLaSource(
        chercherDansLAnnuaireDesEntreprises(recherche),
      )
      return {
        ...retenues(annuaire.suggestions, annuaire.nombre, limite),
        apiUnavailable: annuaire.indisponible,
        cartoUnavailable,
      }
    }

    if (estUneRechercheParSiret(recherche)) {
      const coop = await chercherDansLaCoop(recherche, limite)
      return coop.suggestions.length === 0
        ? enDernierRecours(false)
        : {
            ...retenues(coop.suggestions, coop.nombre, limite),
            apiUnavailable: false,
            cartoUnavailable: false,
          }
    }

    const limiteParSource = Math.ceil(limite / 2)

    const [coop, cartographie] = await Promise.all([
      chercherDansLaCoop(recherche, limiteParSource),
      tenterLaSource(
        chercherDansLaCartographie(recherche, {
          limite: limiteParSource,
          sauf,
        }),
      ),
    ])

    const prioritaires = [
      ...coop.suggestions,
      ...cartographie.suggestions.filter(inconnueDeLaCoop),
    ]

    return prioritaires.length === 0
      ? enDernierRecours(cartographie.indisponible)
      : {
          ...retenues(prioritaires, coop.nombre + cartographie.nombre, limite),
          apiUnavailable: false,
          cartoUnavailable: cartographie.indisponible,
        }
  }
