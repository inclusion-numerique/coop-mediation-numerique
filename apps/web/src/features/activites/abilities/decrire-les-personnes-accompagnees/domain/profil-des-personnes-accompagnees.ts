import type {
  Effectif,
  Genre,
  Repartition,
  StatutSocial,
  TrancheDAge,
} from '../../../domain'

export type ProfilDesPersonnesAccompagnees = {
  readonly total: Effectif
  readonly genres: Repartition<Genre>
  readonly tranchesDAge: Repartition<TrancheDAge>
  readonly statutsSociaux: Repartition<StatutSocial>
}

export const PREMIERE_ANNEE_DE_NAISSANCE = 1900

export const AGE_AVANT_LA_TRANCHE_SUIVANTE = [
  { tranche: 'MoinsDeDouze', avant: 12 },
  { tranche: 'DouzeDixHuit', avant: 18 },
  { tranche: 'DixHuitVingtQuatre', avant: 25 },
  { tranche: 'VingtCinqTrenteNeuf', avant: 40 },
  { tranche: 'QuaranteCinquanteNeuf', avant: 60 },
  { tranche: 'SoixanteSoixanteNeuf', avant: 70 },
] as const

export const TRANCHE_DES_PLUS_AGES = 'SoixanteDixPlus'
