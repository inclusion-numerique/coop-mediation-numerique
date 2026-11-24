import { Search } from '@arckit/resultset'
import { parseAsString } from 'nuqs/server'
import type { PieceLue } from './piece'

const parametres = { recherche: parseAsString.withDefault('') }

export type RechercheLibre = PieceLue<
  typeof parametres,
  { readonly recherche: Search }
> & { readonly _tag: 'Recherche' }

export const rechercheLibre: RechercheLibre = {
  _tag: 'Recherche',
  parametres,
  lire: ({ recherche }) => ({ recherche: Search(recherche.trim()) }),
  ecrire: ({ recherche }) => (recherche === undefined ? {} : { recherche }),
}
