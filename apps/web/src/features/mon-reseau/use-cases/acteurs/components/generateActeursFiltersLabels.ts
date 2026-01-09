import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import {
  type ActeurRole,
  type ActeursFilters,
  acteurRoleLabels,
} from '../validation/ActeursFilters'

export type ActeursFilterType = 'lieux' | 'communes' | 'departements' | 'role'

export const locationTypeLabels: Record<
  'lieu' | 'commune' | 'departement',
  string
> = {
  lieu: 'Lieu d’activité',
  commune: 'Commune',
  departement: 'Département',
}

const generateLieuxLabels = (
  {
    communes = [],
    departements = [],
    lieux = [],
  }: {
    communes?: string[]
    departements?: string[]
    lieux?: string[]
  },
  {
    communesOptions = [],
    departementsOptions = [],
    lieuxActiviteOptions = [],
  }: {
    communesOptions: SelectOption<string>[]
    departementsOptions: SelectOption<string>[]
    lieuxActiviteOptions: LieuActiviteOption[]
  },
) => [
  ...lieuxActiviteOptions
    .filter(({ value }) => lieux?.includes(value))
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'lieux' as const,
    })),
  ...communesOptions
    .filter(({ value }) => communes?.includes(value))
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'communes' as const,
    })),
  ...departementsOptions
    .filter(({ value }) => departements?.includes(value))
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'departements' as const,
    })),
]

export const generateActeursFiltersLabels = (
  { role, departements, communes, lieux }: ActeursFilters,
  {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
  }: {
    communesOptions: SelectOption[]
    lieuxActiviteOptions: LieuActiviteOption[]
    departementsOptions: SelectOption[]
  },
) => {
  const roleLabel = role
    ? {
        label: acteurRoleLabels[role as ActeurRole],
        key: role,
        type: 'role' as const,
      }
    : null

  const lieuxLabels = generateLieuxLabels(
    { communes, departements, lieux },
    { communesOptions, departementsOptions, lieuxActiviteOptions },
  )

  return [...(roleLabel == null ? [] : [roleLabel]), ...lieuxLabels]
}

const labelPrefixes: Record<string, string> = {
  communes: 'Commune : ',
  departements: 'Département : ',
  lieux: "Lieu d'activité : ",
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
