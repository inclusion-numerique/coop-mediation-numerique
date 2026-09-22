import type { ColonneDeListe, LieuAReprendre } from './lieu-a-reprendre'
import type { Releve } from './releve'

export type LireLesLieux = () => Promise<readonly LieuAReprendre[]>

export type TrierLesListes = (
  lieuId: string,
  colonnes: readonly ColonneDeListe[],
) => Promise<void>

export type ReprendreLesHoraires = (
  lieuId: string,
  horaires: string | null,
) => Promise<void>

export type DeposerLeReleve = (releve: Releve) => Promise<readonly string[]>

export type Journal = (message: string) => void
