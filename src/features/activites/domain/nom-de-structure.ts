import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDeStructure = defineModel(
  z.string().trim().min(1).brand('NomDeStructure'),
)

export type NomDeStructure = Model.TypeOf<typeof NomDeStructure>
