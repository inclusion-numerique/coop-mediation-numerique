import type { SortDirection } from '@arckit/resultset'
import type { DataTableUrlState } from '@/libraries/data-table'

export type ParametresDeLaListe = {
  readonly recherche?: string
  readonly tri?: string
  readonly ordre?: string
  readonly page?: string
  readonly lignes?: string
} & Readonly<Record<string, string | readonly string[] | undefined>>

const ordreLu = (ordre?: string): SortDirection | undefined =>
  ordre === 'asc' || ordre === 'desc' ? ordre : undefined

export const etatDeLaTable = (
  parametres: ParametresDeLaListe,
): DataTableUrlState => ({ ...parametres, ordre: ordreLu(parametres.ordre) })
