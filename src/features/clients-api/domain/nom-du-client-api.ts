import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomDuClientApi = defineModel(
  z
    .string()
    .trim()
    .min(1, 'Veuillez renseigner un nom')
    .brand('NomDuClientApi'),
)

export type NomDuClientApi = Model.TypeOf<typeof NomDuClientApi>
