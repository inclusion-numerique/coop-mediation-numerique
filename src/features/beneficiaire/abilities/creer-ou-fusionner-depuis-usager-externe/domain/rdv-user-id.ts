import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RdvUserId = defineModel(
  z.number().int().positive().brand('UsagerId'),
)

export type RdvUserId = Model.TypeOf<typeof RdvUserId>
