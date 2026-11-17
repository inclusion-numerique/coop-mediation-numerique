import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const PerimetrePartage = defineModel(
  z.enum(['Mediateur', 'Coordinateur']).brand('PerimetrePartage'),
)

export type PerimetrePartage = Model.TypeOf<typeof PerimetrePartage>
