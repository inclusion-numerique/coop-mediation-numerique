import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CompteDeLaSessionId = defineModel(
  z.string().trim().min(1).brand('CompteDeLaSessionId'),
)

export type CompteDeLaSessionId = Model.TypeOf<typeof CompteDeLaSessionId>
