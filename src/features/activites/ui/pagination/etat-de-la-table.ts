import type { SortDirection } from '@arckit/resultset'
import type { DataTableUrlState } from '@/libraries/data-table'

const ORDRES: readonly SortDirection[] = ['asc', 'desc']

const ordreLu = (ordre?: string): SortDirection | undefined =>
  ORDRES.find((reconnu) => reconnu === ordre)

export const etatDeLaTable = (
  parametres: Readonly<Record<string, string>>,
): DataTableUrlState => ({
  ...parametres,
  ordre: ordreLu(parametres.ordre),
})
