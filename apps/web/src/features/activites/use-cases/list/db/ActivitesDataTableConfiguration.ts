import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import type { Prisma } from '@prisma/client'
import { ActiviteForList } from './activitesQueries'

export type ActivitesDataTableConfiguration = DataTableConfiguration<
  ActiviteForList,
  Prisma.ActiviteWhereInput,
  Prisma.ActiviteOrderByWithRelationInput
>
