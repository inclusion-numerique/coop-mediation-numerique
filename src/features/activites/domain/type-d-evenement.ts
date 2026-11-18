import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TypeDEvenement = defineModel(
  z
    .enum(['GrandPublic', 'National', 'InclusionNumerique', 'NecLocal'])
    .brand('TypeDEvenement'),
)

export type TypeDEvenement = Model.TypeOf<typeof TypeDEvenement>
