import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const CodesPostaux = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{5}(\s*,\s*\d{5})*$/)
    .brand('CodesPostaux'),
)

export type CodesPostaux = Model.TypeOf<typeof CodesPostaux>
