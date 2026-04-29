import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const BeneficiaireId = defineModel(
  z.string().uuid().brand('BeneficiaireId'),
)

export type BeneficiaireId = Model.TypeOf<typeof BeneficiaireId>
