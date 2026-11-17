import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const genres = ['Masculin', 'Feminin', 'NonCommunique'] as const

/**
 * Un genre absent vaut `NonCommunique` : l'absence est une valeur du domaine,
 * donc le constructeur est total (accepte aussi une valeur absente).
 */
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
