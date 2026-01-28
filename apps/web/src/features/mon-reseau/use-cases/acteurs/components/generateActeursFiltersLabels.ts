import type { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  type ActeurRole,
  type ActeursFilters,
  acteurRoleLabels,
} from '../validation/ActeursFilters'

export type ActeursFilterType = 'communes' | 'role'

export const generateActeursFiltersLabels = (
  { role, communes }: ActeursFilters,
  {
    communesOptions,
  }: {
    communesOptions: SelectOption[]
  },
) => {
  const roleLabel = role
    ? {
        label: acteurRoleLabels[role as ActeurRole],
        key: role,
        type: 'role' as const,
      }
    : null

  const communesLabels = communesOptions
    .filter(({ value }) => communes?.includes(value))
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'communes' as const,
    }))

  return [...(roleLabel == null ? [] : [roleLabel]), ...communesLabels]
}

const labelPrefixes: Record<string, string> = {
  communes: 'Commune : ',
}

export const toLieuPrefix = ({
  label,
  type,
  key,
}: {
  label: string
  type: ActeursFilterType
  key?: string[] | string | null
}) => ({
  label: labelPrefixes[type] ? `${labelPrefixes[type]}${label}` : label,
  type,
  key,
})

export type ActeursFiltersLabels = ReturnType<
  typeof generateActeursFiltersLabels
>
