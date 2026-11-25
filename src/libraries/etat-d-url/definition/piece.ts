import type { ParserMap } from 'nuqs/server'
import type { Valeurs } from './filtre'

export type PieceLue<P extends ParserMap, V> = {
  readonly parametres: P
  readonly lire: (brutes: Valeurs<P>) => V
  readonly ecrire: (lue: Partial<V>) => Readonly<Record<string, unknown>>
}
