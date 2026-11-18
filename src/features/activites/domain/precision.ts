import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Precision = defineModel(
  z.string().trim().min(1).brand('Precision'),
)

export type Precision = Model.TypeOf<typeof Precision>
