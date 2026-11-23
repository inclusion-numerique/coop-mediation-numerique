import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { assainirLeTexteRiche } from '@/libraries/texte-riche'

export const Notes = defineModel(
  z
    .string()
    .transform(assainirLeTexteRiche)
    .pipe(z.string().trim().min(1))
    .brand('Notes'),
)

export type Notes = Model.TypeOf<typeof Notes>
