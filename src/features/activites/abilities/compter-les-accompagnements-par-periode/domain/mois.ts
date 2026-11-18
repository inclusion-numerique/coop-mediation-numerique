import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Mois = defineModel(
  z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .brand('Mois'),
)

export type Mois = Model.TypeOf<typeof Mois>
