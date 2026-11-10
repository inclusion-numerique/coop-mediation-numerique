import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = ['Individuel', 'Collectif'] as const

export const TypeDActivite = defineModel(z.enum(VALEURS).brand('TypeDActivite'))

export type TypeDActivite = Model.TypeOf<typeof TypeDActivite>

export const typesDActivite: readonly TypeDActivite[] =
  VALEURS.map(TypeDActivite)
