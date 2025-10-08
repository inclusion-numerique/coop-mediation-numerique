import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import type { Prisma } from '@prisma/client'
import type { ActiviteListItemWithTimezone } from './activitesQueries'

export type ActivitesDataTableConfiguration = DataTableConfiguration<
  ActiviteListItemWithTimezone,
  Prisma.ActiviteWhereInput,
  Prisma.ActiviteOrderByWithRelationInput
>
