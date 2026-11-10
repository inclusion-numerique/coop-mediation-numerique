import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const GENRES = ['Masculin', 'Feminin', 'NonCommunique'] as const

export const Genre = defineModel(z.enum(GENRES).brand('Genre'))

export type Genre = Model.TypeOf<typeof Genre>

export const genres: readonly Genre[] = GENRES.map(Genre)
