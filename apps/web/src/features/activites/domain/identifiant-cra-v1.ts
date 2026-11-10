import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const IdentifiantCraV1 = defineModel(
  z.string().trim().min(1).brand('IdentifiantCraV1'),
)

export type IdentifiantCraV1 = Model.TypeOf<typeof IdentifiantCraV1>
