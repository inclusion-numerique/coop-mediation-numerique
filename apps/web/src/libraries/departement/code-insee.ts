import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const CodeInsee = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9][0-9AB][0-9]{3}$/)
    .brand('CodeInsee'),
)

export type CodeInsee = Model.TypeOf<typeof CodeInsee>
