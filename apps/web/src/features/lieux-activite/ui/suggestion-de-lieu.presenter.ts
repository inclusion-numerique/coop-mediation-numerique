import { SourceExterne } from '../domain/source-externe'
import type {
  ProvenanceDeSuggestion,
  SuggestionDeLieu,
  SuggestionsDeLieux,
} from '../domain/suggestion-de-lieu'

export type SourceDeSuggestion =
  | 'cartographie_nationale'
  | 'structure_locale'
  | 'api'

export type SuggestionAffichee = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  readonly pivot: string | undefined
  readonly typologie: string | null
  readonly structures: readonly { readonly id: string }[]
  readonly source: SourceDeSuggestion
}

export type SuggestionsAffichees = {
  readonly structures: readonly SuggestionAffichee[]
  readonly matchesCount: number
  readonly moreResults: number
  readonly apiUnavailable: boolean
  readonly cartoUnavailable: boolean
}

const identite = (
  provenance: ProvenanceDeSuggestion,
): Pick<SuggestionAffichee, 'id' | 'structures' | 'source'> =>
  provenance._tag === 'Coop'
    ? {
        id: `structure_${provenance.lieuId}`,
        structures: [{ id: provenance.lieuId }],
        source: 'structure_locale',
      }
    : provenance._tag === 'Cartographie'
      ? {
          id: provenance.identifiant,
          structures:
            provenance.lieuCoop == null ? [] : [{ id: provenance.lieuCoop }],
          source: 'cartographie_nationale',
        }
      : { id: `api_${provenance.siret}`, structures: [], source: 'api' }

export const suggestionAffichee = ({
  provenance,
  nom,
  adresse,
  siret,
  typologies,
}: SuggestionDeLieu): SuggestionAffichee => ({
  ...identite(provenance),
  nom,
  adresse: adresse.voie,
  commune: adresse.commune,
  codePostal: adresse.codePostal,
  codeInsee: adresse.codeInsee,
  complementAdresse: adresse.complement,
  pivot: siret ?? undefined,
  typologie: typologies.length > 0 ? typologies.join(';') : null,
})

export const suggestionsAffichees = ({
  suggestions,
  nombre,
  sourcesEnPanne,
}: SuggestionsDeLieux): SuggestionsAffichees => ({
  structures: suggestions.map(suggestionAffichee),
  matchesCount: nombre,
  moreResults: Math.max(0, nombre - suggestions.length),
  apiUnavailable: sourcesEnPanne.includes(SourceExterne('Annuaire')),
  cartoUnavailable: sourcesEnPanne.includes(SourceExterne('Cartographie')),
})
