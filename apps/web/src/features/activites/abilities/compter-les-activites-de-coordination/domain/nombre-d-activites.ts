import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NombreDActivites = defineModel(
  z.number().int().nonnegative().brand('NombreDActivites'),
)

export type NombreDActivites = Model.TypeOf<typeof NombreDActivites>
