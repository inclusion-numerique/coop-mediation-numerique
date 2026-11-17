import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Precision = defineModel(
  z.string().trim().min(1).brand('Precision'),
)

export type Precision = Model.TypeOf<typeof Precision>
