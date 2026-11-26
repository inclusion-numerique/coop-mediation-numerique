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
