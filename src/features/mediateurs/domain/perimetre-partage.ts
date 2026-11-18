import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PerimetrePartage = defineModel(
  z.enum(['Mediateur', 'Coordinateur']).brand('PerimetrePartage'),
)

export type PerimetrePartage = Model.TypeOf<typeof PerimetrePartage>
