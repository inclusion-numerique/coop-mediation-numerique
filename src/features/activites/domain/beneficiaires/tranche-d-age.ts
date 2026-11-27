import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

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

export const PREMIERE_ANNEE_DE_NAISSANCE = 1900

export const AGE_AVANT_LA_TRANCHE_SUIVANTE: readonly {
  readonly tranche: TrancheDAge
  readonly avant: number
}[] = [
  { tranche: TrancheDAge('MoinsDeDouze'), avant: 12 },
  { tranche: TrancheDAge('DouzeDixHuit'), avant: 18 },
  { tranche: TrancheDAge('DixHuitVingtQuatre'), avant: 25 },
  { tranche: TrancheDAge('VingtCinqTrenteNeuf'), avant: 40 },
  { tranche: TrancheDAge('QuaranteCinquanteNeuf'), avant: 60 },
  { tranche: TrancheDAge('SoixanteSoixanteNeuf'), avant: 70 },
]

export const TRANCHE_DES_PLUS_AGES = TrancheDAge('SoixanteDixPlus')
