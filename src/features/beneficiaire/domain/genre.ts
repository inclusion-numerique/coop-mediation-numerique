import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const genres = ['Masculin', 'Feminin', 'NonCommunique'] as const

export const Genre = defineModel(
  z
    .enum(genres)
    .nullish()
    .transform((value) => value ?? 'NonCommunique'),
)

export type Genre = Model.TypeOf<typeof Genre>

export const genreLabels: Record<Genre, string> = {
  Masculin: 'Masculin',
  Feminin: 'Féminin',
  NonCommunique: 'Non communiqué',
}

export const sexLabels: Record<Genre, string> = {
  Masculin: 'Homme',
  Feminin: 'Femme',
  NonCommunique: 'Non communiqué',
}
