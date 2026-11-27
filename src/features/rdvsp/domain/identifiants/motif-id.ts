import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const MotifId = defineModel(z.number().int().positive().brand('MotifId'))

export type MotifId = Model.TypeOf<typeof MotifId>
