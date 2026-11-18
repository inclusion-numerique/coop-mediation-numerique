import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const BeneficiaireId = defineModel(z.guid().brand('BeneficiaireId'))

export type BeneficiaireId = Model.TypeOf<typeof BeneficiaireId>
