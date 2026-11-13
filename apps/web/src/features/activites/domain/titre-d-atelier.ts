import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TitreDAtelier = defineModel(
  z.string().trim().min(1).brand('TitreDAtelier'),
)

export type TitreDAtelier = Model.TypeOf<typeof TitreDAtelier>
