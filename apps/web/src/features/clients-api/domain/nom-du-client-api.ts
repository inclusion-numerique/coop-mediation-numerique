import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDuClientApi = defineModel(
  z
    .string()
    .trim()
    .min(1, 'Veuillez renseigner un nom')
    .brand('NomDuClientApi'),
)

export type NomDuClientApi = Model.TypeOf<typeof NomDuClientApi>
