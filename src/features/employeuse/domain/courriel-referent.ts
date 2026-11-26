import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CourrielReferent = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('CourrielReferent'),
)

export type CourrielReferent = Model.TypeOf<typeof CourrielReferent>
