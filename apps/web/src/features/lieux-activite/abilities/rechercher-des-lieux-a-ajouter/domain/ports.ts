import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import type { NombreDeLieux } from '../../../domain/nombres'
import type { SuggestionDeLieu } from '../../../domain/suggestion-de-lieu'
import type { TermeDeRecherche } from './terme-de-recherche'

export type SuggestionsDUneSource = {
  readonly suggestions: readonly SuggestionDeLieu[]
  readonly nombre: NombreDeLieux
}

export type ChercherDansLaCoop = (
  terme: TermeDeRecherche,
  limite: NombreDeLieux,
) => Promise<SuggestionsDUneSource>

export type ChercherDansLaCartographie = (
  terme: TermeDeRecherche,
  options: {
    readonly limite: NombreDeLieux
    readonly sauf: readonly IdentifiantCartographie[]
  },
) => Promise<SuggestionsDUneSource>

export type ChercherDansLAnnuaireDesEntreprises = (
  terme: TermeDeRecherche,
) => Promise<SuggestionsDUneSource>

export type RechercherDesLieuxAAjouterPorts = {
  readonly chercherDansLaCoop: ChercherDansLaCoop
  readonly chercherDansLaCartographie: ChercherDansLaCartographie
  readonly chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises
}
