import { CaseCochee } from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import {
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

export const TypesDePublicsAccueillisShape = {
  priseEnChargeSpecifique: z.array(z.enum(PriseEnChargeSpecifique)).nullish(),
  toutPublic: CaseCochee,
  publicsSpecifiquementAdresses: z
    .array(z.enum(PublicSpecifiquementAdresse))
    .nullish(),
}
