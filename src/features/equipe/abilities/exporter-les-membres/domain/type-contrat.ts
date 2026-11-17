import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TypeContrat = defineModel(
  z
    .string()
    .nullish()
    .transform((type) => type ?? 'NonCommunique')
    .pipe(
      z
        .enum(['CDD', 'CDI', 'CDP', 'PEC', 'NonCommunique'])
        .brand('TypeContrat'),
    ),
)

export type TypeContrat = Model.TypeOf<typeof TypeContrat>
