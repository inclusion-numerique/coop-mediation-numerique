import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TypeDEvenement = defineModel(
  z
    .enum(['GrandPublic', 'National', 'InclusionNumerique', 'NecLocal'])
    .brand('TypeDEvenement'),
)

export type TypeDEvenement = Model.TypeOf<typeof TypeDEvenement>
