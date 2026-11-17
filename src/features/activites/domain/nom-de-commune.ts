import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDeCommune = defineModel(
  z.string().trim().min(1).brand('NomDeCommune'),
)

export type NomDeCommune = Model.TypeOf<typeof NomDeCommune>
