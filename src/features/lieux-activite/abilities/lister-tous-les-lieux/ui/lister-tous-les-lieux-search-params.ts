import type { DataTableUrlState } from '@/libraries/data-table'

export const TAILLE_DE_PAGE_PAR_DEFAUT = 100

export type ColonneTriable =
  | 'nom'
  | 'creation'
  | 'modification'
  | 'mediateursEnActivite'

export type ListeDesLieuxSearchParams = {
  readonly recherche?: string
  readonly tri?: string
  readonly ordre?: string
  readonly page?: string
  readonly lignes?: string
}

const ordreLu = (ordre?: string): DataTableUrlState['ordre'] =>
  ordre === 'asc' || ordre === 'desc' ? ordre : undefined

export const toDataTableUrlState = (
  params: ListeDesLieuxSearchParams,
): DataTableUrlState => ({
  recherche: params.recherche,
  tri: params.tri,
  ordre: ordreLu(params.ordre),
  page: params.page,
  lignes: params.lignes,
})
