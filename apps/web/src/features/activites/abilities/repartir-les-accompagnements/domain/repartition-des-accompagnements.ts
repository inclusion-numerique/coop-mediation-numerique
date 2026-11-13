import type {
  Effectif,
  Repartition,
  ThematiqueRecherchee,
  TypeDActivite,
  TypeDeLieu,
} from '../../../domain'
import type { MaterielCompte } from './materiel-compte'
import type { TrancheDeDuree } from './tranche-de-duree'

export type RepartitionDesAccompagnements = {
  readonly total: Effectif
  readonly types: Repartition<TypeDActivite>
  readonly durees: Repartition<TrancheDeDuree>
  readonly typesDeLieu: Repartition<TypeDeLieu>
  readonly thematiques: Repartition<ThematiqueRecherchee>
  readonly materiels: Repartition<MaterielCompte>
}
