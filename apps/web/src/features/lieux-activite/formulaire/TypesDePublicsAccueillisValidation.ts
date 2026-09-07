import {
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

export const TypesDePublicsAccueillisShape = {
  priseEnChargeSpecifique: z
    .array(z.nativeEnum(PriseEnChargeSpecifique))
    .nullish(),
  toutPublic: z.boolean().nullish(),
  publicsSpecifiquementAdresses: z
    .array(z.nativeEnum(PublicSpecifiquementAdresse))
    .nullish(),
}

export const TypesDePublicsAccueillisValidation = z.object({
  id: z.string().uuid(),
  ...TypesDePublicsAccueillisShape,
})

export type TypesDePublicsAccueillisData = z.infer<
  typeof TypesDePublicsAccueillisValidation
>
