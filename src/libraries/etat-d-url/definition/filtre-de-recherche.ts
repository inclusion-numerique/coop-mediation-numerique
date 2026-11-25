import {
  createParser,
  parseAsArrayOf,
  type SingleParserBuilder,
} from 'nuqs/server'
import type { z } from 'zod'
import type { Filtre } from './filtre'

const parseurValide = <S extends z.ZodType>(
  schema: S,
): SingleParserBuilder<z.output<S>> =>
  createParser({
    parse: (lue) => {
      const valide = schema.safeParse(lue)
      return valide.success ? valide.data : null
    },
    serialize: (valeur) => String(valeur),
  })

const parametresDeRecherche = <V>(parseur: SingleParserBuilder<V>) =>
  parseAsArrayOf(parseur).withDefault([])

type ParametresDeRecherche<C extends string, V> = Record<
  C,
  ReturnType<typeof parametresDeRecherche<V>>
>

export type FiltreDeRecherche<C extends string, V = string> = Filtre<
  ParametresDeRecherche<C, V>,
  Record<C, V[]>
> & { readonly cle: C }

export const filtreDeRecherche = <const C extends string, S extends z.ZodType>({
  titre,
  prefixe,
  cle,
  schema,
}: {
  titre: string
  prefixe?: string | undefined
  cle: C
  schema: S
}): FiltreDeRecherche<C, z.output<S>> => ({
  titre,
  prefixe,
  cle,
  parametres: {
    [cle]: parametresDeRecherche(parseurValide(schema)),
  } as ParametresDeRecherche<C, z.output<S>>,
  etiquettes: (lues, libelles) =>
    lues[cle].map((valeur) => ({
      libelle: libelles[cle]?.get(String(valeur)) ?? String(valeur),
      sans: { [cle]: lues[cle].filter((autre) => autre !== valeur) } as Partial<
        Record<C, z.output<S>[]>
      >,
    })),
})
