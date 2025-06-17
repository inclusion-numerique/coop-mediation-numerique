import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import type { DataTableSearchParams } from '@app/web/libs/data-table/DataTableConfiguration'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { typeActiviteLabels } from '../../cra/fields/type-activite'
import type { ActivitesDataTableConfiguration } from '../db/ActivitesDataTableConfiguration'
import type { ActiviteForList } from '../db/activitesQueries'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import styles from './MesActivitesListePage.module.css'

export const ActivitesDataTable = {
  csvFilename: () => `coop-${dateAsIsoDay(new Date())}-activites`,
  rowKey: ({ id }) => id,
  columns: [
    {
      name: 'date',
      header: 'Date',
      csvHeaders: ['Date'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      cellAsTh: true,
      sortable: true,
      csvValues: ({ date }) => [dateAsIsoDay(date)],
      cell: ({ date }) => dateAsDay(date),
    },
    {
      name: 'type',
      header: 'Type',
      csvHeaders: ['Type'],
      csvValues: ({ type }: ActiviteForList) => [typeActiviteLabels[type]],
      cell: ({ type }) => typeActiviteLabels[type],
      cellClassName: styles.typeCell,
      sortable: true,
    },
    {
      name: 'beneficiaire',
      header: 'Bénéficiaire',
      csvHeaders: ['Bénéficiaire'],
      csvValues: (activite) => [
        activite.type === 'Collectif'
          ? `${activite.accompagnements.length} participants`
          : getBeneficiaireDisplayName(
              activite.accompagnements[0]?.beneficiaire ?? {},
            ),
      ],
      cell: (activite) =>
        activite.type === 'Collectif'
          ? `${activite.accompagnements.length} participants`
          : getBeneficiaireDisplayName(
              activite.accompagnements[0]?.beneficiaire ?? {},
            ),
      cellClassName: styles.beneficiaireCell,
    },
    {
      name: 'lieu',
      header: 'Lieu',
      csvHeaders: ['Lieu'],
      csvValues: () => [],
      cell: ({ structure, lieuCommune, lieuCodePostal, typeLieu }) =>
        typeLieu === 'LieuActivite' && structure
          ? structure.nom
          : typeLieu === 'ADistance'
            ? 'À distance'
            : lieuCommune
              ? `${lieuCommune} · ${lieuCodePostal}`
              : '-',
      cellClassName: styles.lieuCell,
    },
    {
      name: 'creation',
      header: 'Enregistrée le',
      csvHeaders: ['enregistree_le'],
      csvValues: ({ creation }) => [dateAsIsoDay(creation)],
      cell: ({ creation }) => dateAsDay(creation),
    },
  ],
} satisfies ActivitesDataTableConfiguration

export type ActivitesDataTableSearchParams = DataTableSearchParams<
  ActivitesDataTableConfiguration,
  ActivitesFilters
>
