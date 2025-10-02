import type { SessionUser } from '@app/web/auth/sessionUser'
import type {
  ActivitesFiltersLabels,
  FilterType,
} from '@app/web/features/activites/use-cases/list/components/generateActivitesFiltersLabels'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import type { Worksheet } from 'exceljs'

const onlyType = (type: string) => (filter: { type: string }) =>
  filter.type === type

const toLabel = ({ label }: { label: string }) => label

export const addFilters =
  (worksheet: Worksheet) =>
  (
    filters: ActivitesFiltersLabels,
    {
      mediateurScope,
      excludeFilters = [],
    }: {
      mediateurScope: null | Pick<SessionUser, 'firstName' | 'lastName'>
      excludeFilters?: FilterType[]
    },
  ) => {
    addTitleRow(worksheet)('Filtres')

    return worksheet.addRows(
      [
        !excludeFilters.includes('periode')
          ? [
              'Période',
              filters.find((filter) => filter.type === 'periode')?.label ?? '-',
            ]
          : undefined,
        !excludeFilters.includes('source')
          ? [
              'Source',
              filters.find((filter) => filter.type === 'source')?.label ?? '-',
            ]
          : undefined,
        !excludeFilters.includes('lieux')
          ? [
              'Lieux d’accompagnement',
              filters
                .filter(onlyType('lieux'))
                .map(({ label }) => label)
                .join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('communes')
          ? [
              'Communes',
              filters.filter(onlyType('communes')).map(toLabel).join(', ') ||
                '-',
            ]
          : undefined,
        !excludeFilters.includes('departements')
          ? [
              'Départements',
              filters
                .filter(onlyType('departements'))
                .map(toLabel)
                .join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('types')
          ? [
              'Type d’accompagnement',
              filters.filter(onlyType('types')).map(toLabel).join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('conseiller_numerique')
          ? [
              'Rôle',
              filters.find((filter) => filter.type === 'conseiller_numerique')
                ?.label ?? '-',
            ]
          : undefined,
        !excludeFilters.includes('thematiqueNonAdministratives')
          ? [
              'Thématiques non administratives',
              filters
                .filter(onlyType('thematiqueNonAdministratives'))
                .map(toLabel)
                .join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('thematiqueAdministratives')
          ? [
              'Thématiques administratives',
              filters
                .filter(onlyType('thematiqueAdministratives'))
                .map(toLabel)
                .join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('tags')
          ? [
              'Tags',
              filters.filter(onlyType('tags')).map(toLabel).join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('beneficiaires') &&
        filters.filter(onlyType('beneficiaires')).length > 0
          ? [
              'Bénéficiaires',
              filters
                .filter(onlyType('beneficiaires'))
                .map(toLabel)
                .join(', ') || '-',
            ]
          : undefined,
        !excludeFilters.includes('mediateurs') &&
        filters.filter(onlyType('mediateurs')).length > 0
          ? [
              'Médiateurs',
              filters.filter(onlyType('mediateurs')).map(toLabel).join(', ') ||
                '-',
            ]
          : undefined,
        mediateurScope
          ? [
              'Médiateur',
              `${mediateurScope.firstName} ${mediateurScope.lastName}`,
            ]
          : undefined,
        [],
      ].filter(Boolean),
    )
  }
