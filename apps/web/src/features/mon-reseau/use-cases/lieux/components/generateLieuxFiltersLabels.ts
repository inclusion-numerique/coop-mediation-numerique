import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import type { LieuxFilters } from '../validation/LieuxFilters'

export type LieuxFilterType = 'mediateurs' | 'communes' | 'departements'

const generateLieuxLabels = (
  {
    communes = [],
    departements = [],
  }: {
    communes?: string[]
    departements?: string[]
  },
  {
    communesOptions = [],
    departementsOptions = [],
  }: {
    communesOptions: SelectOption<string>[]
    departementsOptions: SelectOption<string>[]
  },
) => [
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

const generateMediateursLabels = ({
  mediateurs = [],
  mediateursOptions,
}: {
  mediateurs?: string[]
  mediateursOptions: MediateurOption[]
}) =>
  mediateursOptions
    .filter(
      ({ value }) =>
        value?.mediateurId && mediateurs.includes(value.mediateurId),
    )
    .map(({ label, value }) => ({
      label,
      key: value!.mediateurId,
      type: 'mediateurs' as const,
    }))

export const generateLieuxFiltersLabels = (
  { departements, communes, mediateurs }: LieuxFilters,
  {
    communesOptions,
    departementsOptions,
    mediateursOptions,
  }: {
    communesOptions: SelectOption[]
    departementsOptions: SelectOption[]
    mediateursOptions: MediateurOption[]
  },
) => {
  const lieuxLabels = generateLieuxLabels(
    { communes, departements },
    { communesOptions, departementsOptions },
  )

  const mediateursLabels = generateMediateursLabels({
    mediateurs,
    mediateursOptions,
  })

  return [...lieuxLabels, ...mediateursLabels]
}

const labelPrefixes: Record<string, string> = {
  communes: 'Commune : ',
  departements: 'Département : ',
  mediateurs: 'Médiateur : ',
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
