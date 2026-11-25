import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDeLActivite = defineModel(
  z.string().trim().min(1).brand('NomDeLActivite'),
)

export type NomDeLActivite = Model.TypeOf<typeof NomDeLActivite>
