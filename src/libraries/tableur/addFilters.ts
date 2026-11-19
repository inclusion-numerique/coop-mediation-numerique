import type { Worksheet } from 'exceljs'

type FiltreDisponible = {
  readonly label: string
  readonly type: string
  readonly masqueSiVide?: boolean
}

type Filtre = {
  readonly type: string
  readonly label: string
}

const toLabel = ({ label }: { label: string }) => label

const onlyType = (type: string) => (filter: { type: string }) =>
  filter.type === type

const visibleAvec =
  (filters: readonly Filtre[]) =>
  ({ type, masqueSiVide }: FiltreDisponible) =>
    !masqueSiVide || filters.some(onlyType(type))

export const addFilters =
  (worksheet: Worksheet, availableFilters: readonly FiltreDisponible[]) =>
  (filters: readonly Filtre[]) =>
    worksheet.addRows(
      availableFilters
        .filter(visibleAvec(filters))
        .map(({ label, type }) => [
          label,
          filters.filter(onlyType(type)).map(toLabel).join(', ') || '-',
        ]),
    )
