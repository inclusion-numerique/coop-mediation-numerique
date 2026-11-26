import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RdvAgentId = defineModel(
  z.number().int().positive().brand('RdvAgentId'),
)

export type RdvAgentId = Model.TypeOf<typeof RdvAgentId>
