import type { Prisma } from '@app/web/generated/prisma/client'
import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import type { ActiviteListItemWithTimezone } from './activitesQueries'

export type ActivitesDataTableConfiguration = DataTableConfiguration<
  ActiviteListItemWithTimezone,
  Prisma.ActiviteWhereInput,
  Prisma.ActiviteOrderByWithRelationInput
>
