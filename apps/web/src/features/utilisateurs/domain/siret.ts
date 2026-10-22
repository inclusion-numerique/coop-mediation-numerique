import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Siret = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{14}$/)
    .brand('Siret'),
)

export type Siret = Model.TypeOf<typeof Siret>
