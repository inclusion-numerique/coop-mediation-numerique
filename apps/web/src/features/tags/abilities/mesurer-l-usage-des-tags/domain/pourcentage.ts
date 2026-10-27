import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Pourcentage = defineModel(
  z.number().int().min(0).max(100).brand('Pourcentage'),
)

export type Pourcentage = Model.TypeOf<typeof Pourcentage>
