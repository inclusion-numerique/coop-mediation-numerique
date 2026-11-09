import { defineModel, type Model } from '@app/web/libraries/model'
import {
  CodeInsee,
  type Nom,
  type Siret,
  type Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import type { IdentifiantCartographie } from './ids-cartographie-nationale'
import type { LieuId } from './lieu-id'
import type { NombreDeLieux } from './nombres'

export const AdresseLibre = defineModel(
  z
    .object({
      voie: z.string().trim(),
      commune: z.string().trim(),
      codePostal: z.string().trim(),
      codeInsee: CodeInsee.schema.nullable().catch(null),
      complement: z.string().trim().min(1).nullable().catch(null),
    })
    .brand('AdresseLibre'),
)

export type AdresseLibre = Model.TypeOf<typeof AdresseLibre>

export type ProvenanceDeSuggestion =
  | { readonly _tag: 'Coop'; readonly lieuId: LieuId }
  | {
      readonly _tag: 'Cartographie'
      readonly identifiant: IdentifiantCartographie
      readonly lieuCoop: LieuId | null
    }
  | { readonly _tag: 'Annuaire'; readonly siret: Siret }

export type SuggestionDeLieu = {
  readonly provenance: ProvenanceDeSuggestion
  readonly nom: Nom
  readonly adresse: AdresseLibre
  readonly siret: Siret | null
  readonly typologies: readonly Typologie[]
}

export type SuggestionsDeLieux = {
  readonly suggestions: readonly SuggestionDeLieu[]
  readonly nombre: NombreDeLieux
  readonly annuaireIndisponible: boolean
  readonly cartographieIndisponible: boolean
}

export const connueDeLaCoop = ({ provenance }: SuggestionDeLieu): boolean =>
  provenance._tag === 'Coop' ||
  (provenance._tag === 'Cartographie' && provenance.lieuCoop != null)
