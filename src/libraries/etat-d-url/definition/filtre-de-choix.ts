import {
  createParser,
  parseAsArrayOf,
  type SingleParserBuilder,
} from 'nuqs/server'
import type { Filtre } from './filtre'

const valeursDe = <V extends string>(choix: Readonly<Record<V, string>>) =>
  Object.keys(choix) as V[]

const parseurDeValeur = <V extends string>(
  choix: Readonly<Record<V, string>>,
  dansLURL: Readonly<Record<V, string>> | undefined,
): SingleParserBuilder<V> =>
  createParser({
    parse: (lue) =>
      valeursDe(choix).find(
        (valeur) => (dansLURL?.[valeur] ?? valeur) === lue,
      ) ?? null,
    serialize: (valeur) => dansLURL?.[valeur] ?? valeur,
  })

const parametresDeChoix = <V extends string>(parseur: SingleParserBuilder<V>) =>
  parseAsArrayOf(parseur).withDefault([])

const parametreDeChoixUnique = <V extends string>(
  parseur: SingleParserBuilder<V>,
) => parseur

type ParametresDeChoix<C extends string, V extends string> = Record<
  C,
  ReturnType<typeof parametresDeChoix<V>>
>

type ParametresDeChoixUnique<C extends string, V extends string> = Record<
  C,
  ReturnType<typeof parametreDeChoixUnique<V>>
>

type AvecChoix<C extends string, V extends string> = {
  readonly titre: string
  readonly cle: C
  readonly choix: Readonly<Record<V, string>>
  readonly dansLURL?: Readonly<Record<V, string>>
}

export type FiltreDeChoix<C extends string, V extends string> = Filtre<
  ParametresDeChoix<C, V>,
  Record<C, V[]>
> &
  AvecChoix<C, V> & { readonly unique: false }

export type FiltreDeChoixUnique<C extends string, V extends string> = Filtre<
  ParametresDeChoixUnique<C, V>,
  Record<C, V | null>
> &
  AvecChoix<C, V> & { readonly unique: true }

export const filtreDeChoix = <const C extends string, const V extends string>({
  titre,
  cle,
  choix,
  dansLURL,
}: AvecChoix<C, V>): FiltreDeChoix<C, V> => ({
  titre,
  cle,
  choix,
  unique: false,
  parametres: {
    [cle]: parametresDeChoix(parseurDeValeur(choix, dansLURL)),
  } as ParametresDeChoix<C, V>,
  etiquettes: (lues) =>
    lues[cle].map((valeur) => ({
      libelle: choix[valeur],
      sans: { [cle]: lues[cle].filter((autre) => autre !== valeur) } as Partial<
        Record<C, V[]>
      >,
    })),
})

export const filtreDeChoixUnique = <
  const C extends string,
  const V extends string,
>({
  titre,
  cle,
  choix,
  dansLURL,
}: AvecChoix<C, V>): FiltreDeChoixUnique<C, V> => ({
  titre,
  cle,
  choix,
  unique: true,
  parametres: {
    [cle]: parametreDeChoixUnique(parseurDeValeur(choix, dansLURL)),
  } as ParametresDeChoixUnique<C, V>,
  etiquettes: (lues) => {
    const valeur = lues[cle]
    return valeur === null
      ? []
      : [
          {
            libelle: choix[valeur],
            sans: { [cle]: null } as Partial<Record<C, V | null>>,
          },
        ]
  },
})
