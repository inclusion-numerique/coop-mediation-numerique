import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const OrigineCompte = defineModel(
  z.enum(['Reel', 'Fixture']).brand('OrigineCompte'),
)

export type OrigineCompte = Model.TypeOf<typeof OrigineCompte>
