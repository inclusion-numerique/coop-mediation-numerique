import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TYPES_DE_LIEU = [
  'LieuActivite',
  'Domicile',
  'Autre',
  'ADistance',
] as const

export const TypeDeLieu = defineModel(z.enum(TYPES_DE_LIEU).brand('TypeDeLieu'))

export type TypeDeLieu = Model.TypeOf<typeof TypeDeLieu>

export const typesDeLieu: readonly TypeDeLieu[] = TYPES_DE_LIEU.map(TypeDeLieu)
