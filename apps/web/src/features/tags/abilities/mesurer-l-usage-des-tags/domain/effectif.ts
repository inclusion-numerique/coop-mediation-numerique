import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Effectif = defineModel(
  z.number().int().nonnegative().brand('Effectif'),
)

export type Effectif = Model.TypeOf<typeof Effectif>
