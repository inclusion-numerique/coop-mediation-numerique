import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TitreDAtelier = defineModel(
  z.string().trim().min(1).brand('TitreDAtelier'),
)

export type TitreDAtelier = Model.TypeOf<typeof TitreDAtelier>
