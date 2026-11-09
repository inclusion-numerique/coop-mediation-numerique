import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import { NombreDeLieux } from '../../../domain/nombres'
import {
  connueDeLaCoop,
  type SuggestionDeLieu,
  type SuggestionsDeLieux,
} from '../../../domain/suggestion-de-lieu'
import type { RechercherDesLieuxAAjouterPorts } from './ports'
import type { RechercheDeLieu } from './recherche-de-lieu'

const LONGUEUR_MINIMALE = 3

const LIMITE_PAR_DEFAUT = 50

const aucuneSuggestion: SuggestionsDeLieux = {
  suggestions: [],
  nombre: NombreDeLieux(0),
  annuaireIndisponible: false,
  cartographieIndisponible: false,
}

export const estUneRechercheParSiret = (recherche: RechercheDeLieu): boolean =>
  /^\d{9,14}$/.test(recherche.replace(/\s/g, ''))

const indisponible = {
  suggestions: [],
  nombre: NombreDeLieux(0),
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
) => ({
  suggestions: suggestions.slice(0, limite),
  nombre: NombreDeLieux(nombre),
})

export const rechercherDesLieuxAAjouter =
  ({
    chercherDansLaCoop,
    chercherDansLaCartographie,
    chercherDansLAnnuaireDesEntreprises,
  }: RechercherDesLieuxAAjouterPorts) =>
  async (
    recherche: RechercheDeLieu,
    {
      limite = LIMITE_PAR_DEFAUT,
      sauf = [],
    }: {
      readonly limite?: number
      readonly sauf?: readonly IdentifiantCartographie[]
    } = {},
  ): Promise<SuggestionsDeLieux> => {
    if (recherche.length < LONGUEUR_MINIMALE) return aucuneSuggestion

    const enDernierRecours = async (
      cartographieIndisponible: boolean,
    ): Promise<SuggestionsDeLieux> => {
      const annuaire = await tenterLaSource(
        chercherDansLAnnuaireDesEntreprises(recherche),
      )
      return {
        ...retenues(annuaire.suggestions, annuaire.nombre, limite),
        annuaireIndisponible: annuaire.indisponible,
        cartographieIndisponible,
      }
    }

    if (estUneRechercheParSiret(recherche)) {
      const coop = await chercherDansLaCoop(recherche, limite)
      return coop.suggestions.length === 0
        ? enDernierRecours(false)
        : {
            ...retenues(coop.suggestions, coop.nombre, limite),
            annuaireIndisponible: false,
            cartographieIndisponible: false,
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
      ...cartographie.suggestions.filter(
        (suggestion) => !connueDeLaCoop(suggestion),
      ),
    ]

    return prioritaires.length === 0
      ? enDernierRecours(cartographie.indisponible)
      : {
          ...retenues(prioritaires, coop.nombre + cartographie.nombre, limite),
          annuaireIndisponible: false,
          cartographieIndisponible: cartographie.indisponible,
        }
  }
