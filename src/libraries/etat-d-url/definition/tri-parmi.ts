import { Sort } from '@arckit/resultset'
import { createParser, parseAsStringLiteral } from 'nuqs/server'
import type { PieceLue } from './piece'

const SENS = ['asc', 'desc'] as const

const parseurDeColonne = <C extends string>(colonnes: readonly C[]) =>
  createParser({
    parse: (lue) => colonnes.find((colonne) => colonne === lue) ?? null,
    serialize: (colonne: C) => colonne,
  })

const parametresDuTri = <C extends string>(
  colonnes: readonly C[],
  parDefaut: Sort<C>,
) => ({
  tri: parseurDeColonne(colonnes).withDefault(parDefaut.field),
  ordre: parseAsStringLiteral(SENS).withDefault(parDefaut.direction),
})

export type TriParmi<C extends string> = PieceLue<
  ReturnType<typeof parametresDuTri<C>>,
  { readonly tri: Sort<C> }
> & {
  readonly _tag: 'Tri'
  readonly colonnes: readonly C[]
  readonly parDefaut: Sort<C>
}

export const triParmi = <const C extends string>({
  colonnes,
  parDefaut,
}: {
  colonnes: readonly C[]
  parDefaut: Sort<NoInfer<C>>
}): TriParmi<C> => ({
  _tag: 'Tri',
  colonnes,
  parDefaut,
  parametres: parametresDuTri(colonnes, parDefaut),
  lire: ({ tri, ordre }) => ({ tri: Sort(tri, ordre) }),
  ecrire: ({ tri }) =>
    tri === undefined ? {} : { tri: tri.field, ordre: tri.direction },
})
