import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TRANCHES_D_AGE = [
  'MoinsDeDouze',
  'DouzeDixHuit',
  'DixHuitVingtQuatre',
  'VingtCinqTrenteNeuf',
  'QuaranteCinquanteNeuf',
  'SoixanteSoixanteNeuf',
  'SoixanteDixPlus',
  'NonCommunique',
] as const

export const TrancheDAge = defineModel(
  z.enum(TRANCHES_D_AGE).brand('TrancheDAge'),
)

export type TrancheDAge = Model.TypeOf<typeof TrancheDAge>

export const tranchesDAge: readonly TrancheDAge[] =
  TRANCHES_D_AGE.map(TrancheDAge)
