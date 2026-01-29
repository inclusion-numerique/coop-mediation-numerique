import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuxFilters } from '../validation/LieuxFilters'

export type LieuxFilterType = 'communes'

export const generateLieuxFiltersLabels = (
  { communes }: LieuxFilters,
  {
    communesOptions,
  }: {
    communesOptions: SelectOption[]
  },
) =>
  communesOptions
    .filter(({ value }) => communes?.includes(value))
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'communes' as const,
    }))

const labelPrefixes: Record<string, string> = {
  communes: 'Commune : ',
}

export const toLieuPrefix = ({
  label,
  type,
  key,
}: {
  label: string
  type: LieuxFilterType
  key?: string[] | string | null
}) => ({
  label: labelPrefixes[type] ? `${labelPrefixes[type]}${label}` : label,
  type,
  key,
})

export type LieuxFiltersLabels = ReturnType<typeof generateLieuxFiltersLabels>
