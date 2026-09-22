import type { ColonneDeListe, LieuATrier } from './lieu-a-trier'
import type { Releve } from './releve'

export type LireLesLieux = () => Promise<readonly LieuATrier[]>

export type TrierLesListes = (
  lieuId: string,
  colonnes: readonly ColonneDeListe[],
) => Promise<void>

export type DeposerLeReleve = (releve: Releve) => Promise<readonly string[]>

export type Journal = (message: string) => void
