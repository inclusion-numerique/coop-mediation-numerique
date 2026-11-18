import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const CodeInsee = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(?:\d{5}|2[AB]\d{3})$/)
    .brand('CodeInsee'),
)

export type CodeInsee = Model.TypeOf<typeof CodeInsee>
