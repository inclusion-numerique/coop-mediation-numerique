import type { SuggestionDeLieu } from '../../../domain/suggestion-de-lieu'

export type SuggestionsDUneSource = {
  readonly suggestions: readonly SuggestionDeLieu[]
  readonly nombre: number
}

export type ChercherDansLaCoop = (
  recherche: string,
  limite: number,
) => Promise<SuggestionsDUneSource>

export type ChercherDansLaCartographie = (
  recherche: string,
  options: { readonly limite: number; readonly sauf: readonly string[] },
) => Promise<SuggestionsDUneSource>

export type ChercherDansLAnnuaireDesEntreprises = (
  recherche: string,
) => Promise<SuggestionsDUneSource>

export type RechercherDesLieuxAAjouterPorts = {
  readonly chercherDansLaCoop: ChercherDansLaCoop
  readonly chercherDansLaCartographie: ChercherDansLaCartographie
  readonly chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises
}
