import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RdvId = defineModel(z.number().int().positive().brand('RdvId'))

export type RdvId = Model.TypeOf<typeof RdvId>
