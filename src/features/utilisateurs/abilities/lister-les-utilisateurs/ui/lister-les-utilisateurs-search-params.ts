import type { SortDirection } from '@arckit/resultset'
import type { ParametresDeFiltres } from '@/features/utilisateurs/domain'
import type { DataTableUrlState } from '@/libraries/data-table'

export type ParametresDeLaListe = {
  readonly recherche?: string
  readonly tri?: string
  readonly ordre?: string
  readonly page?: string
  readonly lignes?: string
} & ParametresDeFiltres

const ordreLu = (ordre?: string): SortDirection | undefined =>
  ordre === 'asc' || ordre === 'desc' ? ordre : undefined

export const etatDeLaTable = (
  parametres: ParametresDeLaListe,
): DataTableUrlState => ({ ...parametres, ordre: ordreLu(parametres.ordre) })
