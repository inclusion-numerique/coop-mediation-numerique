import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import z from 'zod'

export const TypesDePublicsAccueillisShape = {
  priseEnChargeSpecifique: z
    .array(z.enum(vocabulaire.priseEnChargeSpecifique.valeurs))
    .nullish(),
  toutPublic: z.boolean().nullish(),
  publicsSpecifiquementAdresses: z
    .array(z.enum(vocabulaire.publicSpecifiquementAdresse.valeurs))
    .nullish(),
}

export const TypesDePublicsAccueillisValidation = z.object({
  id: z.string().uuid(),
  ...TypesDePublicsAccueillisShape,
})

export type TypesDePublicsAccueillisData = z.infer<
  typeof TypesDePublicsAccueillisValidation
>
