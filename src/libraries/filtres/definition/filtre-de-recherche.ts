import { parseAsArrayOf, parseAsString } from 'nuqs/server'
import type { Filtre } from './filtre'

const parametresDeRecherche = parseAsArrayOf(parseAsString).withDefault([])

type ParametresDeRecherche<C extends string> = Record<
  C,
  typeof parametresDeRecherche
>

export type FiltreDeRecherche<C extends string> = Filtre<
  ParametresDeRecherche<C>,
  Record<C, string[]>
> & { readonly cle: C }

export const filtreDeRecherche = <const C extends string>({
  cle,
}: {
  cle: C
}): FiltreDeRecherche<C> => ({
  cle,
  parametres: { [cle]: parametresDeRecherche } as ParametresDeRecherche<C>,
  etiquettes: (lues, libelles) =>
    lues[cle].map((valeur) => ({
      libelle: libelles[cle]?.get(valeur) ?? valeur,
      sans: { [cle]: lues[cle].filter((autre) => autre !== valeur) } as Partial<
        Record<C, string[]>
      >,
    })),
})
