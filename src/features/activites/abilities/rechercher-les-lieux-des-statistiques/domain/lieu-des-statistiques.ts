import type { Departement } from '@app/web/libraries/departement'
import type { CodeDepartement, CodeInsee } from '@app/web/libraries/insee'
import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { Commune, LieuActiviteId, NomDeStructure } from '../../../domain'

export const GENRES_DE_LIEU = [
  'LieuDActivite',
  'Commune',
  'Departement',
] as const

export const GenreDeLieu = defineModel(
  z.enum(GENRES_DE_LIEU).brand('GenreDeLieu'),
)

export type GenreDeLieu = Model.TypeOf<typeof GenreDeLieu>

export type LieuDesStatistiques =
  | {
      readonly genre: 'LieuDActivite'
      readonly id: LieuActiviteId
      readonly nom: NomDeStructure
    }
  | { readonly genre: 'Commune'; readonly commune: Commune }
  | { readonly genre: 'Departement'; readonly departement: Departement }

export type LieuxChoisis = {
  readonly lieux: readonly LieuActiviteId[]
  readonly communes: readonly CodeInsee[]
  readonly departements: readonly CodeDepartement[]
}
