import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type {
  FiltresDeLaListe,
  OptionDeBeneficiaire,
  OptionDeMediateur,
} from '@app/web/features/activites/ui/filtres/filtres-de-la-liste'
import { libelleDuStatutDansLURL } from '@app/web/features/activites/ui/libelles/statut-de-rendez-vous'
import { thematiqueLabels } from '@app/web/features/activites/ui/libelles/thematique'
import { typeActiviteSlugLabels } from '@app/web/features/activites/ui/libelles/type-activite'
import { dateAsDay } from '@app/web/utils/dateAsDay'

export type FilterType =
  | 'lieux'
  | 'communes'
  | 'departements'
  | 'beneficiaires'
  | 'mediateurs'
  | 'structuresEmployeuses'
  | 'periode'
  | 'types'
  | 'conseiller_numerique'
  | 'rdvs'
  | 'thematiqueNonAdministratives'
  | 'thematiqueAdministratives'
  | 'tags'
  | 'source'
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
  { beneficiaires = [] }: Pick<FiltresDeLaListe, 'beneficiaires'>,
  {
    beneficiairesOptions = [],
  }: { beneficiairesOptions: OptionDeBeneficiaire[] },
) =>
  beneficiairesOptions
    .filter(({ value }) => value?.id && beneficiaires.includes(value.id))
    .map(({ label, value }) => ({
      label,
      key: value?.id,
      type: 'beneficiaires' as const,
    }))

const generateMediateurFilterLabel = (
  { mediateurs = [] }: Pick<FiltresDeLaListe, 'mediateurs'>,
  { mediateursOptions = [] }: { mediateursOptions: OptionDeMediateur[] },
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
  { source = '' }: Pick<FiltresDeLaListe, 'source'>,
  { optionsDesSources = [] }: { optionsDesSources: SelectOption[] },
) =>
  optionsDesSources
    .filter(({ value }) => value && source === value)
    .map(({ label, value }) => ({
      label,
      key: value,
      type: 'source' as const,
    }))

const generateStructuresEmployeusesFilterLabel = (
  {
    structuresEmployeuses = [],
  }: Pick<FiltresDeLaListe, 'structuresEmployeuses'>,
  {
    structuresEmployeusesOptions = [],
  }: { structuresEmployeusesOptions: { id: string; nom: string }[] },
) =>
  structuresEmployeusesOptions
    .filter(({ id }) => structuresEmployeuses.includes(id))
    .map(({ id, nom }) => ({
      label: nom,
      key: id,
      type: 'structuresEmployeuses' as const,
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
    structuresEmployeuses,
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
  }: FiltresDeLaListe,
  {
    beneficiairesOptions,
    mediateursOptions,
    structuresEmployeusesOptions,
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    tagsOptions,
    optionsDesSources,
  }: {
    beneficiairesOptions: OptionDeBeneficiaire[]
    mediateursOptions: OptionDeMediateur[]
    structuresEmployeusesOptions: { id: string; nom: string }[]
    communesOptions: SelectOption[]
    lieuxActiviteOptions: SelectOption[]
    departementsOptions: SelectOption[]
    tagsOptions: { id: string; nom: string }[]
    optionsDesSources: SelectOption[]
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
        label: `RDV ${libelleDuStatutDansLURL(rdv)}`,
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

  const structuresEmployeusesLabels = generateStructuresEmployeusesFilterLabel(
    { structuresEmployeuses },
    { structuresEmployeusesOptions },
  )

  const lieuxLabels = generateLieuxLabels(
    { communes, departements, lieux },
    { communesOptions, departementsOptions, lieuxActiviteOptions },
  )

  const sourceLabel =
    optionsDesSources && source
      ? generateSourceFilterLabel({ source }, { optionsDesSources })
      : null

  return [
    ...mediateursLabels,
    ...(roleLabel == null ? [] : [roleLabel]),
    ...structuresEmployeusesLabels,
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
  structuresEmployeuses: 'Structure employeuse : ',
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
