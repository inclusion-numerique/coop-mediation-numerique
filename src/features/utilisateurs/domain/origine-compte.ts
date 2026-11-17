import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const OrigineCompte = defineModel(
  z.enum(['Reel', 'Fixture']).brand('OrigineCompte'),
)

export type OrigineCompte = Model.TypeOf<typeof OrigineCompte>

export const origineDuCompte = (estUneFixture: boolean): OrigineCompte =>
  OrigineCompte(estUneFixture ? 'Fixture' : 'Reel')
