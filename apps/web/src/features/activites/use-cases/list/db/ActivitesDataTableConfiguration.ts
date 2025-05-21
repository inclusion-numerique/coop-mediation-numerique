import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import type { Prisma } from '@prisma/client'
import { ActiviteListItem } from './activitesQueries'

export type ActivitesDataTableConfiguration = DataTableConfiguration<
  ActiviteListItem,
  Prisma.ActiviteWhereInput,
  Prisma.ActiviteOrderByWithRelationInput
>
