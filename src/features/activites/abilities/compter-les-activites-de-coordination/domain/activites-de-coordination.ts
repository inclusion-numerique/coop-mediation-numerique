import {
  type TypeDActiviteDeCoordination,
  typesDActiviteDeCoordination,
} from '../../../domain'
import { NombreDActivites } from './nombre-d-activites'
import {
  memeTrimestre,
  plusRecentDAbord,
  type Trimestre,
  trimestreDe,
} from './trimestre'

export type ActiviteADecompter = {
  readonly type: TypeDActiviteDeCoordination
  readonly date: Date
}

export type DecompteParType = readonly {
  readonly type: TypeDActiviteDeCoordination
  readonly nombre: NombreDActivites
}[]

export type DecompteDuTrimestre = {
  readonly trimestre: Trimestre
  readonly decompte: DecompteParType
}

export type ActivitesDeCoordination = {
  readonly cumul: DecompteParType
  readonly trimestres: readonly DecompteDuTrimestre[]
}

const decompter = (activites: readonly ActiviteADecompter[]): DecompteParType =>
  typesDActiviteDeCoordination.map((type) => ({
    type,
    nombre: NombreDActivites(
      activites.filter((activite) => activite.type === type).length,
    ),
  }))

const trimestresDistincts = (
  activites: readonly ActiviteADecompter[],
): readonly Trimestre[] =>
  activites
    .map(({ date }) => trimestreDe(date))
    .filter(
      (trimestre, rang, trimestres) =>
        trimestres.findIndex((autre) => memeTrimestre(autre, trimestre)) ===
        rang,
    )
    .toSorted(plusRecentDAbord)

export const decompterParTrimestre = (
  activites: readonly ActiviteADecompter[],
): ActivitesDeCoordination => ({
  cumul: decompter(activites),
  trimestres: trimestresDistincts(activites).map((trimestre) => ({
    trimestre,
    decompte: decompter(
      activites.filter(({ date }) =>
        memeTrimestre(trimestreDe(date), trimestre),
      ),
    ),
  })),
})
