import type { LieuAReprendre } from './lieu-a-reprendre'
import type { Releve } from './releve'

export type LireLesLieux = () => Promise<readonly LieuAReprendre[]>

export type DeposerLeReleve = (releve: Releve) => Promise<readonly string[]>

export type Journal = (message: string) => void
