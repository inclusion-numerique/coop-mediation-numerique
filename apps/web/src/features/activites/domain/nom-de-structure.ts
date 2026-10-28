import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDeStructure = defineModel(
  z.string().trim().min(1).brand('NomDeStructure'),
)

export type NomDeStructure = Model.TypeOf<typeof NomDeStructure>
