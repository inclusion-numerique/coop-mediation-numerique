import { z } from 'zod'
import type { Departement } from '@/libraries/departement'
import type { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
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
