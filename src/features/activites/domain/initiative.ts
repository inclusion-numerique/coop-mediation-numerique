import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Initiative = defineModel(
  z.enum(['Initiative', 'Demande']).brand('Initiative'),
)

export type Initiative = Model.TypeOf<typeof Initiative>
