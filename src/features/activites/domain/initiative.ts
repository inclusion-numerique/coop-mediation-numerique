import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Initiative = defineModel(
  z.enum(['Initiative', 'Demande']).brand('Initiative'),
)

export type Initiative = Model.TypeOf<typeof Initiative>
