import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomStructure = defineModel(
  z.string().trim().min(1).brand('NomStructure'),
)

export type NomStructure = Model.TypeOf<typeof NomStructure>
