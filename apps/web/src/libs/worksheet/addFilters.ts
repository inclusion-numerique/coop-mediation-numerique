import type { Worksheet } from 'exceljs'

type AvailableFilter = {
  label: string
  type: string
}

type Filter = {
  type: string
  key: string
  label: string
}

const toLabel = ({ label }: { label: string }) => label

const onlyType = (type: string) => (filter: { type: string }) =>
  filter.type === type

export const addFilters =
  (worksheet: Worksheet, availableFilters: AvailableFilter[]) =>
  (filters: Filter[]) =>
    worksheet.addRows(
      availableFilters.map(({ label, type }) => [
        label,
        filters.filter(onlyType(type)).map(toLabel).join(', ') || '-',
      ]),
    )
