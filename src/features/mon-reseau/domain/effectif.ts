import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Effectif = defineModel(
  z.number().int().nonnegative().brand('Effectif'),
)

export type Effectif = Model.TypeOf<typeof Effectif>
