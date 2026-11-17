import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NombreDeLieux = defineModel(
  z.number().int().nonnegative().brand('NombreDeLieux'),
)

export type NombreDeLieux = Model.TypeOf<typeof NombreDeLieux>
