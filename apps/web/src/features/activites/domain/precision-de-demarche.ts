import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const PrecisionDeDemarche = defineModel(
  z.string().trim().min(1).brand('PrecisionDeDemarche'),
)

export type PrecisionDeDemarche = Model.TypeOf<typeof PrecisionDeDemarche>
