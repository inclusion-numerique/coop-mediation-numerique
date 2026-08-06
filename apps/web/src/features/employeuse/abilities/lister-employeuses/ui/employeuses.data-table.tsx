import type {
  DataTableConfiguration,
  DataTableFilterValues,
  DataTableSearchParams,
} from '@app/web/libs/data-table/DataTableConfiguration'
import { dateAsDayAndTime } from '@app/web/utils/dateAsDayAndTime'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { optionalNumberToString } from '@app/web/utils/formatNumber'
import type { Prisma } from '@prisma/client'
import type { EmployeuseAffichee } from './employeuse-affichee.presenter'

export type EmployeusesDataTableConfiguration = DataTableConfiguration<
  EmployeuseAffichee,
  Prisma.StructureAdministrativeMainWhereInput,
  Prisma.StructureAdministrativeMainOrderByWithRelationInput
>

export const EmployeusesDataTable = {
  csvFilename: () => `coop-${dateAsIsoDay(new Date())}-structures-employeuses`,
  rowKey: ({ id }) => id,
  rowLink: ({ id }) => ({
    href: `/administration/structures-employeuses/${id}`,
  }),
  columns: [
    {
      name: 'nom',
      header: 'Nom',
      csvHeaders: ['Nom'],
      csvValues: ({ nom }) => [nom],
      cell: ({ nom }) => nom,
      defaultSortable: true,
      defaultSortableDirection: 'asc',
      orderBy: (direction) => [{ denominationAntenne: direction }],
    },
    {
      name: 'siret',
      header: 'SIRET',
      csvHeaders: ['SIRET'],
      csvValues: ({ siret }) => [siret],
      cell: ({ siret }) => siret,
    },
    {
      name: 'adresse',
      header: 'Adresse',
      csvHeaders: ['Adresse', 'Code postal'],
      csvValues: ({ adresse, codePostal }) => [adresse, codePostal],
      cell: ({ adresse, codePostal }) => (
        <div>
          <div className="fr-text--sm fr-mb-0">{adresse}</div>
          <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
            {codePostal}
          </div>
        </div>
      ),
    },
    {
      name: 'commune',
      header: 'Commune',
      csvHeaders: ['Commune'],
      csvValues: ({ commune }) => [commune],
      cell: ({ commune }) => commune,
    },
    {
      name: 'emplois',
      header: 'Emplois',
      csvHeaders: ['Emplois'],
      csvValues: ({ _count }) => [_count.emplois],
      cell: ({ _count }) => optionalNumberToString(_count.emplois, null),
      orderBy: (direction) => [{ affectationsEmploi: { _count: direction } }],
    },
    {
      name: 'creation',
      header: 'Création',
      csvHeaders: ['Création'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      csvValues: ({ creation }) => [creation.toISOString()],
      cell: ({ creation }) => dateAsDayAndTime(creation),
      orderBy: (direction) => [{ createdAt: direction }],
    },
    {
      name: 'modification',
      header: 'Modification',
      csvHeaders: ['Modification'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      csvValues: ({ modification }) => [modification.toISOString()],
      cell: ({ modification }) => dateAsDayAndTime(modification),
      orderBy: (direction) => [{ updatedAt: direction }],
    },
  ],
} satisfies EmployeusesDataTableConfiguration

export type EmployeusesSearchParams =
  DataTableSearchParams<EmployeusesDataTableConfiguration>

export type StructuresAdministrativesDataTableFilterValues =
  DataTableFilterValues<EmployeusesDataTableConfiguration>
