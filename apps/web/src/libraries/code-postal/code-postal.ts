import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const CodePostal = defineModel(
  z
    .string()
    .transform((saisi) => saisi.replaceAll(/\s/g, ''))
    .pipe(
      z
        .string()
        .regex(/^\d{5}$/)
        .brand('CodePostal'),
    ),
)

export type CodePostal = Model.TypeOf<typeof CodePostal>
