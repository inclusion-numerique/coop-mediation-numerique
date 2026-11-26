import type { Result } from '@/libraries/result'
import type { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import type { NombreDeLieux } from '../../../domain/nombres'
import type { SuggestionDeLieu } from '../../../domain/suggestion-de-lieu'
import type { SourceIndisponible } from './errors'
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
) => Promise<Result<SuggestionsDUneSource, SourceIndisponible>>

export type ChercherDansLAnnuaireDesEntreprises = (
  terme: TermeDeRecherche,
) => Promise<Result<SuggestionsDUneSource, SourceIndisponible>>

export type RechercherDesLieuxAAjouterPorts = {
  readonly chercherDansLaCoop: ChercherDansLaCoop
  readonly chercherDansLaCartographie: ChercherDansLaCartographie
  readonly chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises
}
