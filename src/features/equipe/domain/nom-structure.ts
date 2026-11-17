import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomStructure = defineModel(
  z.string().trim().min(1).brand('NomStructure'),
)

export type NomStructure = Model.TypeOf<typeof NomStructure>
