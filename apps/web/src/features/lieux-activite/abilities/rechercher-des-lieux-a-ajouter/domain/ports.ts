import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import type { NombreDeLieux } from '../../../domain/nombres'
import type { SuggestionDeLieu } from '../../../domain/suggestion-de-lieu'
import type { RechercheDeLieu } from './recherche-de-lieu'

export type SuggestionsDUneSource = {
  readonly suggestions: readonly SuggestionDeLieu[]
  readonly nombre: NombreDeLieux
}

export type ChercherDansLaCoop = (
  recherche: RechercheDeLieu,
  limite: number,
) => Promise<SuggestionsDUneSource>

export type ChercherDansLaCartographie = (
  recherche: RechercheDeLieu,
  options: {
    readonly limite: number
    readonly sauf: readonly IdentifiantCartographie[]
  },
) => Promise<SuggestionsDUneSource>

export type ChercherDansLAnnuaireDesEntreprises = (
  recherche: RechercheDeLieu,
) => Promise<SuggestionsDUneSource>

export type RechercherDesLieuxAAjouterPorts = {
  readonly chercherDansLaCoop: ChercherDansLaCoop
  readonly chercherDansLaCartographie: ChercherDansLaCartographie
  readonly chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises
}
