import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Pourcentage = defineModel(
  z.number().int().min(0).max(100).brand('Pourcentage'),
)

export type Pourcentage = Model.TypeOf<typeof Pourcentage>
