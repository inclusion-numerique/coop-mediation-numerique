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
