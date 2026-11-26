import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Rna = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^W\d{9}$/)
    .brand('Rna'),
)

export type Rna = Model.TypeOf<typeof Rna>
