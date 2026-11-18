import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDeCommune = defineModel(
  z.string().trim().min(1).brand('NomDeCommune'),
)

export type NomDeCommune = Model.TypeOf<typeof NomDeCommune>
