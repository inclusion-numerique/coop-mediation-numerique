import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Siren = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{9}$/)
    .brand('Siren'),
)

export type Siren = Model.TypeOf<typeof Siren>
