import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CodesPostaux = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{5}(\s*,\s*\d{5})*$/)
    .brand('CodesPostaux'),
)

export type CodesPostaux = Model.TypeOf<typeof CodesPostaux>
