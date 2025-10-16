import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { thematiqueLabels } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import type { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuFilterType } from '@app/web/features/lieux-activite/use-cases/filter/LieuFilter'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import {
  type RdvStatus,
  rdvStatusLabels,
} from '@app/web/rdv-service-public/rdvStatus'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { typeActiviteSlugLabels } from '../../cra/fields/type-activite'
import { activiteSourceLabels } from '../../source/activiteSource'
import type { ActivitesFilters } from '../validation/ActivitesFilters'

export type FilterType =
  | 'lieux'
  | 'communes'
  | 'departements'
  | 'beneficiaires'
  | 'mediateurs'
  | 'periode'
  | 'types'
  | 'conseiller_numerique'
  | 'rdvs'
  | 'thematiqueNonAdministratives'
  | 'thematiqueAdministratives'
  | 'tags'
  | 'source'
export const locationTypeLabels: {
  [key in LieuFilterType]: string
} = {
  lieu: 'Lieu d’activité',
  commune: 'Commune',
  departement: 'Département',
}

export const generateActivitesPeriodeFilterLabel = ({
  au,
  du,
}: {
  au: string
  du: string
}) => ({
  label: `${dateAsDay(new Date(du))} - ${dateAsDay(new Date(au))}`,
  key: ['du', 'au'],
  type: 'periode' as const,
})

const generateBeneficiaireFilterLabel = (
  { beneficiaires = [] }: Pick<ActivitesFilters, 'beneficiaires'>,
  { beneficiairesOptions = [] }: { beneficiairesOptions: BeneficiaireOption[] },
) =>
  beneficiairesOptions
    .filter(({ value }) => value?.id && beneficiaires.includes(value.id))
    .map(({ label, value }) => ({
      label,
      key: value?.id,
      type: 'beneficiaires' as const,
    }))

const generateMediateurFilterLabel = (
  { mediateurs = [] }: Pick<ActivitesFilters, 'mediateurs'>,
  { mediateursOptions = [] }: { mediateursOptions: MediateurOption[] },
) =>
  mediateursOptions
    .filter(
      ({ value }) =>
        value?.mediateurId && mediateurs.includes(value.mediateurId),
    )
    .map(({ label, value }) => ({
      label,
      key: value?.mediateurId,
      type: 'mediateurs' as const,
    }))

const generateSourceFilterLabel = (
  { source = '' }: Pick<ActivitesFilters, 'source'>,
  { activiteSourceOptions = [] }: { activiteSourceOptions: SelectOption[] },
) =>
  activiteSourceOptions
    .filter(({ value }) => value && source === value)
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'source' as const,
    }))

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
    lieuxActiviteOptions: SelectOption<string>[]
  },
) => [
  ...lieuxActiviteOptions
    .filter(({ value }) => lieux?.includes(value))
    .map(({ label, value }) => ({ label, key: value, type: 'lieux' as const })),
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

export const generateActivitesFiltersLabels = (
  {
    beneficiaires,
    mediateurs,
    types,
    thematiqueAdministratives,
    thematiqueNonAdministratives,
    tags,
    conseiller_numerique,
    departements,
    communes,
    lieux,
    rdvs,
    au,
    du,
    source,
  }: ActivitesFilters,
  {
    beneficiairesOptions,
    mediateursOptions,
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    tagsOptions,
    activiteSourceOptions,
  }: {
    beneficiairesOptions: BeneficiaireOption[]
    mediateursOptions: MediateurOption[]
    communesOptions: SelectOption[]
    lieuxActiviteOptions: SelectOption[]
    departementsOptions: SelectOption[]
    tagsOptions: { id: string; nom: string }[]
    activiteSourceOptions: SelectOption[]
  },
) => {
  const periode =
    du && au
      ? generateActivitesPeriodeFilterLabel({
          du,
          au,
        })
      : null

  const typesLabel = types
    ? types.map((key) => ({
        label: typeActiviteSlugLabels[key],
        key,
        type: 'types' as const,
      }))
    : []

  const thematiqueNonAdministrativeLabels =
    thematiqueNonAdministratives?.map((key) => ({
      label: thematiqueLabels[key],
      key,
      type: 'thematiqueNonAdministratives' as const,
    })) ?? []

  const thematiqueAdministrativeLabels =
    thematiqueAdministratives?.map((key) => ({
      label: thematiqueLabels[key],
      key,
      type: 'thematiqueAdministratives' as const,
    })) ?? []

  const tagLabels =
    tags
      ?.map((key) => {
        const tagOption = tagsOptions?.find((option) => option.id === key)
        return tagOption
          ? {
              label: tagOption.nom,
              key,
              type: 'tags' as const,
            }
          : null
      })
      .filter((tag) => tag != null) ?? []

  const rdvsLabel = rdvs
    ? rdvs.map((rdv) => ({
        label: `RDV ${rdvStatusLabels[rdv as RdvStatus]}`,
        key: rdv,
        type: 'rdvs' as const,
      }))
    : []

  const roleLabel = conseiller_numerique
    ? {
        label:
          conseiller_numerique === '1'
            ? 'Conseiller numérique'
            : 'Médiateur numérique',
        key: conseiller_numerique,
        type: 'conseiller_numerique' as const,
      }
    : null

  const beneficiairesLabels = generateBeneficiaireFilterLabel(
    { beneficiaires },
    { beneficiairesOptions },
  )

  const mediateursLabels = generateMediateurFilterLabel(
    { mediateurs },
    { mediateursOptions },
  )

  const lieuxLabels = generateLieuxLabels(
    { communes, departements, lieux },
    { communesOptions, departementsOptions, lieuxActiviteOptions },
  )

  const sourceLabel =
    activiteSourceOptions && source
      ? generateSourceFilterLabel({ source }, { activiteSourceOptions })
      : null

  return [
    ...mediateursLabels,
    ...(roleLabel == null ? [] : [roleLabel]),
    ...(periode == null ? [] : [periode]),
    ...lieuxLabels,
    ...typesLabel,
    ...rdvsLabel,
    ...beneficiairesLabels,
    ...thematiqueNonAdministrativeLabels,
    ...thematiqueAdministrativeLabels,
    ...tagLabels,
    ...(sourceLabel == null ? [] : sourceLabel),
  ]
}

const labelPrefixes: Record<string, string> = {
  communes: 'Commune : ',
  departements: 'Département : ',
  lieux: 'Lieu d’activité : ',
}

export const toLieuPrefix = ({
  label,
  type,
  key,
}: {
  label: string
  type: FilterType
  key?: string[] | string | null
}) => ({
  label: labelPrefixes[type] ? `${labelPrefixes[type]}${label}` : label,
  type,
  key,
})

export type ActivitesFiltersLabels = ReturnType<
  typeof generateActivitesFiltersLabels
>
