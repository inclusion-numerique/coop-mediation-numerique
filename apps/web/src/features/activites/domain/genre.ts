import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = ['Masculin', 'Feminin', 'NonCommunique'] as const

export const Genre = defineModel(z.enum(VALEURS).brand('Genre'))

export type Genre = Model.TypeOf<typeof Genre>

export const genres: readonly Genre[] = VALEURS.map(Genre)
