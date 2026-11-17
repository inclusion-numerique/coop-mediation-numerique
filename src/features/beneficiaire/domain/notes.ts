import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Notes = defineModel(z.string().trim().min(1).brand('Notes'))

export type Notes = Model.TypeOf<typeof Notes>
