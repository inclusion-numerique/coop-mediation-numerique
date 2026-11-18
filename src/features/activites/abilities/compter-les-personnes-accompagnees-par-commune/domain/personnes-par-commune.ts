import type { CommuneComptee, Effectif } from '../../../domain'

export type PersonnesParCommune = readonly {
  readonly commune: CommuneComptee
  readonly nombre: Effectif
}[]
