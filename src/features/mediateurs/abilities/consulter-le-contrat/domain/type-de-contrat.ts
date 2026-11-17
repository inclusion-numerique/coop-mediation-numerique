import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const typesDeContrat = ['CDD', 'CDI', 'CDP', 'PEC'] as const

export const TypeDeContrat = defineModel(
  z.string().pipe(z.enum(typesDeContrat)),
)

export type TypeDeContrat = Model.TypeOf<typeof TypeDeContrat>
