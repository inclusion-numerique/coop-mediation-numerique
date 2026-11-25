import {
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'
import { CaseCochee } from '@/features/lieux-activite/domain/saisie/regles-de-saisie'

export const TypesDePublicsAccueillisShape = {
  priseEnChargeSpecifique: z.array(z.enum(PriseEnChargeSpecifique)).nullish(),
  toutPublic: CaseCochee,
  publicsSpecifiquementAdresses: z
    .array(z.enum(PublicSpecifiquementAdresse))
    .nullish(),
}
