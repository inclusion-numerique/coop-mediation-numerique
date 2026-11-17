import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const IdentifiantCraV1 = defineModel(
  z.string().trim().min(1).brand('IdentifiantCraV1'),
)

export type IdentifiantCraV1 = Model.TypeOf<typeof IdentifiantCraV1>
