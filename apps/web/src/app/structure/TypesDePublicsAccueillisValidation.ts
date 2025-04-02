import z from 'zod'
import { priseEnChargeSpecifiqueValues } from './priseEnChargeSpecifique'
import { publicSpecifiquementAdresseValues } from './publicSpecifiquementAdresse'

export const TypesDePublicsAccueillisShape = {
  priseEnChargeSpecifique: z
    .array(z.enum(priseEnChargeSpecifiqueValues))
    .nullish(),
  toutPublic: z.boolean().nullish(),
  publicsSpecifiquementAdresses: z
    .array(z.enum(publicSpecifiquementAdresseValues))
    .nullish(),
}

export const TypesDePublicsAccueillisValidation = z.object({
  id: z.string().uuid(),
  ...TypesDePublicsAccueillisShape,
})

export type TypesDePublicsAccueillisData = z.infer<
  typeof TypesDePublicsAccueillisValidation
>
