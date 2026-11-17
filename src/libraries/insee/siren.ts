import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Siren = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{9}$/)
    .brand('Siren'),
)

export type Siren = Model.TypeOf<typeof Siren>
