import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDeLActivite = defineModel(
  z.string().trim().min(1).brand('NomDeLActivite'),
)

export type NomDeLActivite = Model.TypeOf<typeof NomDeLActivite>
