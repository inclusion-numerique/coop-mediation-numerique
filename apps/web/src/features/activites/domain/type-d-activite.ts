import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TYPES_D_ACTIVITE = ['Individuel', 'Collectif'] as const

export const TypeDActivite = defineModel(
  z.enum(TYPES_D_ACTIVITE).brand('TypeDActivite'),
)

export type TypeDActivite = Model.TypeOf<typeof TypeDActivite>

export const typesDActivite: readonly TypeDActivite[] =
  TYPES_D_ACTIVITE.map(TypeDActivite)
