import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PrecisionDeDemarche = defineModel(
  z.string().trim().min(1).brand('PrecisionDeDemarche'),
)

export type PrecisionDeDemarche = Model.TypeOf<typeof PrecisionDeDemarche>
