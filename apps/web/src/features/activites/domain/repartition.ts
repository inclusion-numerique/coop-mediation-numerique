import { Effectif } from './effectif'

export type LigneDeRepartition<V> = {
  readonly valeur: V
  readonly nombre: Effectif
}

export type Repartition<V> = readonly LigneDeRepartition<V>[]

export const repartitionComplete = <V>(
  valeurs: readonly V[],
  nombres: readonly number[],
): Repartition<V> =>
  valeurs.map((valeur, rang) => ({
    valeur,
    nombre: Effectif(nombres[rang] ?? 0),
  }))
