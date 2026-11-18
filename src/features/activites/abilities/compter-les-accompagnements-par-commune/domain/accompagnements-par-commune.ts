import type { CommuneComptee, Effectif } from '../../../domain'

export type AccompagnementsParCommune = readonly {
  readonly commune: CommuneComptee
  readonly nombre: Effectif
}[]
