import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const UsagerId = defineModel(
  z.number().int().positive().brand('UsagerId'),
)

export type UsagerId = Model.TypeOf<typeof UsagerId>
