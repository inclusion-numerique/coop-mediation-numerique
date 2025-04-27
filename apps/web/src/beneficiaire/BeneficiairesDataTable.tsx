import type { BeneficiaireForList } from '@app/web/beneficiaire/queryBeneficiairesForList'
import type {
  DataTableConfiguration,
  DataTableFilterValues,
  DataTableSearchParams,
} from '@app/web/libs/data-table/DataTableConfiguration'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { numberToString } from '@app/web/utils/formatNumber'
import type { Prisma } from '@prisma/client'

export type BeneficiairesDataTableConfiguration = DataTableConfiguration<
  BeneficiaireForList,
  Prisma.BeneficiaireWhereInput,
  Prisma.BeneficiaireOrderByWithRelationInput
>

export const BeneficiairesDataTable = {
  csvFilename: () => `coop-${dateAsIsoDay(new Date())}-beneficiaires`,
  rowKey: ({ id }) => id,
  rowLink: ({ id }) => ({ href: `/coop/mes-beneficiaires/${id}` }),
  columns: [
    {
      name: 'nom',
      header: 'Nom',
      csvHeaders: ['Nom'],
      defaultSortable: true,
      csvValues: ({ nom }) => [nom],
      cell: ({ nom }) => nom,
      orderBy: (direction) => [
        {
          nom: direction,
        },
      ],
    },
    {
      name: 'prenom',
      header: 'Prénom',
      csvHeaders: ['Prénom'],
      csvValues: ({ prenom }) => [prenom],
      cell: ({ prenom }) => prenom,
      orderBy: (direction) => [
        {
          prenom: direction,
        },
      ],
    },
    {
      name: 'annee-naissance',
      header: 'Année de naissance',
      csvHeaders: ['Année de naissance'],
      csvValues: ({ anneeNaissance }) => [anneeNaissance],
      cell: ({ anneeNaissance }) => anneeNaissance || '-',
      headerClassName: 'fr-text--right',
      cellClassName: 'fr-text--right',
      orderBy: (direction) => [
        {
          anneeNaissance: direction,
        },
      ],
    },
    {
      name: 'accompagnements',
      header: 'Accompagnements',
      csvHeaders: ['Accompagnements'],
      csvValues: ({ _count: { accompagnements } }) => [accompagnements],
      cell: ({ _count: { accompagnements } }) =>
        numberToString(accompagnements),
      headerClassName: 'fr-text--right',
      cellClassName: 'fr-text--right',
      orderBy: (direction) => [
        {
          accompagnements: {
            // TODO Cannot sort by supression:null until: https://github.com/prisma/prisma/issues/20838
            _count: direction,
          },
        },
      ],
    },
  ],
} satisfies BeneficiairesDataTableConfiguration

export type BeneficiairesDataTableSearchParams =
  DataTableSearchParams<BeneficiairesDataTableConfiguration>

export type BeneficiairesDataTableFilterValues =
  DataTableFilterValues<BeneficiairesDataTableConfiguration>
