import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const BeneficiaireId = defineModel(z.guid().brand('BeneficiaireId'))

export type BeneficiaireId = Model.TypeOf<typeof BeneficiaireId>
