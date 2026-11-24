import { parseAsArrayOf, parseAsStringLiteral } from 'nuqs/server'
import type { Filtre } from './filtre'

const valeursDe = <V extends string>(choix: Readonly<Record<V, string>>) =>
  Object.keys(choix) as V[]

const parametresDeChoix = <V extends string>(valeurs: readonly V[]) =>
  parseAsArrayOf(parseAsStringLiteral(valeurs)).withDefault([])

const parametreDeChoixUnique = <V extends string>(valeurs: readonly V[]) =>
  parseAsStringLiteral(valeurs)

type ParametresDeChoix<C extends string, V extends string> = Record<
  C,
  ReturnType<typeof parametresDeChoix<V>>
>

type ParametresDeChoixUnique<C extends string, V extends string> = Record<
  C,
  ReturnType<typeof parametreDeChoixUnique<V>>
>

type AvecChoix<C extends string, V extends string> = {
  readonly cle: C
  readonly choix: Readonly<Record<V, string>>
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
  cle,
  choix,
}: AvecChoix<C, V>): FiltreDeChoix<C, V> => ({
  cle,
  choix,
  unique: false,
  parametres: {
    [cle]: parametresDeChoix(valeursDe(choix)),
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
  cle,
  choix,
}: AvecChoix<C, V>): FiltreDeChoixUnique<C, V> => ({
  cle,
  choix,
  unique: true,
  parametres: {
    [cle]: parametreDeChoixUnique(valeursDe(choix)),
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
