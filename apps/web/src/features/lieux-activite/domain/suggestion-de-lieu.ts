export type SourceDeSuggestion =
  | 'cartographie_nationale'
  | 'structure_locale'
  | 'api'

export type SuggestionDeLieu = {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  complementAdresse: string | null
  pivot: string | undefined
  typologie: string | null
  latitude: number | null
  longitude: number | null
  structures: { id: string }[]
  source: SourceDeSuggestion
}

export type SuggestionsDeLieux = {
  structures: SuggestionDeLieu[]
  matchesCount: number
  moreResults: number
  apiUnavailable: boolean
  cartoUnavailable: boolean
}
