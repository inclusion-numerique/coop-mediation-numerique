import type { CommuneComptee, Effectif } from '../../../domain'

export type PersonnesParCommune = readonly {
  readonly commune: CommuneComptee
  readonly nombre: Effectif
}[]

export const premierCodePostal = (codes: string | null): string | null =>
  codes?.split(',').at(0)?.trim() ?? null
