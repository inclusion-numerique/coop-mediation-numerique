import type { DataTableUrlState } from '@/libraries/data-table'
import { DEFAULT_PAGE } from '@/libraries/data-table/pagination/page-size-options'
import { entierPositifLu } from '@/libraries/parametres-d-url'
import {
  COLONNES_TRIABLES,
  type ColonneTriable,
  type CriteresDeLaListe,
} from '../../domain/criteres-de-la-liste'

export const TAILLE_DE_PAGE_PAR_DEFAUT = 100

export type ListeDesLieuxSearchParams = {
  readonly recherche?: string
  readonly tri?: string
  readonly ordre?: string
  readonly page?: string
  readonly lignes?: string
}

const ordreLu = (ordre?: string): DataTableUrlState['ordre'] =>
  ordre === 'asc' || ordre === 'desc' ? ordre : undefined

const estUneColonneTriable = (tri: string): tri is ColonneTriable =>
  COLONNES_TRIABLES.some((colonne) => colonne === tri)

export const criteresDeLaListe = (
  params: ListeDesLieuxSearchParams,
): CriteresDeLaListe => ({
  recherche: params.recherche,
  tri:
    params.tri && estUneColonneTriable(params.tri)
      ? {
          colonne: params.tri,
          ordre: params.ordre === 'desc' ? 'desc' : 'asc',
        }
      : undefined,
  page: entierPositifLu(params.page, DEFAULT_PAGE),
  lignes: entierPositifLu(params.lignes, TAILLE_DE_PAGE_PAR_DEFAUT),
})

export const toDataTableUrlState = (
  params: ListeDesLieuxSearchParams,
): DataTableUrlState => ({
  recherche: params.recherche,
  tri: params.tri,
  ordre: ordreLu(params.ordre),
  page: params.page,
  lignes: params.lignes,
})
