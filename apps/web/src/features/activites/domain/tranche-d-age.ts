import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = [
  'MoinsDeDouze',
  'DouzeDixHuit',
  'DixHuitVingtQuatre',
  'VingtCinqTrenteNeuf',
  'QuaranteCinquanteNeuf',
  'SoixanteSoixanteNeuf',
  'SoixanteDixPlus',
  'NonCommunique',
] as const

export const TrancheDAge = defineModel(z.enum(VALEURS).brand('TrancheDAge'))

export type TrancheDAge = Model.TypeOf<typeof TrancheDAge>

export const tranchesDAge: readonly TrancheDAge[] = VALEURS.map(TrancheDAge)
