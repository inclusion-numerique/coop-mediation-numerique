import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NombreDeLieux = defineModel(
  z.number().int().nonnegative().brand('NombreDeLieux'),
)

export type NombreDeLieux = Model.TypeOf<typeof NombreDeLieux>
