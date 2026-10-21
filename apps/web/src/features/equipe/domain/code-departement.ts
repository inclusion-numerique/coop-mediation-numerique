import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const CodeDepartement = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(?:\d{2}|2[AB]|97\d)$/)
    .brand('CodeDepartement'),
)

export type CodeDepartement = Model.TypeOf<typeof CodeDepartement>
