import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import type { DataTableSearchParams } from '@app/web/libs/data-table/DataTableConfiguration'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import { typeActiviteLabels } from '../../cra/fields/type-activite'
import type { ActivitesDataTableConfiguration } from '../db/ActivitesDataTableConfiguration'
import type { ActiviteListItem } from '../db/activitesQueries'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import styles from './MesActivitesListePage.module.css'

export const ActivitesDataTable = {
  csvFilename: () => `coop-${dateAsIsoDay(new Date())}-activites`,
  rowKey: ({ id }) => id,
  columns: [
    {
      name: 'activite',
      header: 'Activité',
      csvHeaders: ['activite', 'beneficiaire'],
      csvValues: ({ type, accompagnements }: ActiviteListItem) => [
        typeActiviteLabels[type],
        type === 'Collectif'
          ? `${accompagnements.length} participants`
          : getBeneficiaireDisplayName(accompagnements[0]?.beneficiaire ?? {}),
      ],
      cell: ({ type, accompagnements }) => (
        <>
          <p className="fr-text-mention--grey fr-text--xs fr-mb-0-5v">
            {typeActiviteLabels[type]}
          </p>
          <p className="fr-mb-0">
            {type === 'Collectif'
              ? `${accompagnements.length} participants`
              : getBeneficiaireDisplayName(
                  accompagnements[0]?.beneficiaire ?? {},
                )}
          </p>
        </>
      ),
      cellClassName: styles.typeCell,
    },
    {
      name: 'date',
      header: 'Date',
      csvHeaders: ['date'],
      csvValues: ({ date }) => [dateAsIsoDay(date)],
      cell: ({ date }) => dateAsDay(date),
      defaultSortable: true,
      defaultSortableDirection: 'desc',
    },
    {
      name: 'duree',
      header: 'Durée',
      csvHeaders: ['duree'],
      csvValues: ({ duree }) => [duree ? dureeAsString(duree) : ''],
      cell: ({ duree }) => (duree ? dureeAsString(duree) : ''),
    },
    {
      name: 'lieu_d_activite',
      header: 'Lieu d’activité',
      csvHeaders: ['lieu_d_activite'],
      csvValues: ({ structure, typeLieu }) => [
        typeLieu === 'LieuActivite' && structure ? structure.nom : '-',
      ],
      cell: ({ structure, typeLieu }) =>
        typeLieu === 'LieuActivite' && structure ? structure.nom : '-',
      cellClassName: styles.lieuCell,
    },
    {
      name: 'creation',
      header: 'Enregistrée le',
      csvHeaders: ['enregistree_le'],
      csvValues: ({ creation }) => [dateAsIsoDay(creation)],
      cell: ({ creation }) => dateAsDay(creation),
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
