import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Mois = defineModel(
  z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .brand('Mois'),
)

export type Mois = Model.TypeOf<typeof Mois>
