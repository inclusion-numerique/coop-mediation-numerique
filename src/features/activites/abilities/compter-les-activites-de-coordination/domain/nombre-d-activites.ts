import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NombreDActivites = defineModel(
  z.number().int().nonnegative().brand('NombreDActivites'),
)

export type NombreDActivites = Model.TypeOf<typeof NombreDActivites>
