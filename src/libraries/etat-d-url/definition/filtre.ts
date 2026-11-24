import type { inferParserType, ParserMap } from 'nuqs/server'

export type Valeurs<P extends ParserMap> = inferParserType<P>

export type Libelles = Readonly<
  Partial<Record<string, ReadonlyMap<string, string>>>
>

export type Etiquette<V> = {
  readonly libelle: string
  readonly sans: Partial<V>
}

export type Filtre<P extends ParserMap, V = Valeurs<P>> = {
  readonly titre: string
  readonly prefixe?: string | undefined
  readonly parametres: P
  readonly etiquettes: (
    valeurs: V,
    libelles: Libelles,
  ) => readonly Etiquette<V>[]
}

export type FiltreQuelconque = {
  readonly titre: string
  readonly prefixe?: string | undefined
  readonly parametres: ParserMap
  readonly etiquettes: (
    valeurs: never,
    libelles: Libelles,
  ) => readonly Etiquette<object>[]
}

export const etiquettesDe = (
  filtre: FiltreQuelconque,
  valeurs: object,
  libelles: Libelles,
): readonly Etiquette<object>[] =>
  (filtre as unknown as Filtre<ParserMap, object>).etiquettes(valeurs, libelles)
