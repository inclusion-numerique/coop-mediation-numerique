import type { RawDataTableSqlConfiguration } from '@app/web/libs/data-table/RawDataTableSqlConfiguration'
import { Prisma } from '@prisma/client'
import { ActivitesDataTableConfiguration } from './ActivitesDataTableConfiguration'

export const ActivitesRawSqlConfiguration = {
  date: {
    rawOrderBySql: (direction) =>
      Prisma.raw(`date ${direction}, act.creation ${direction}`),
    rawFilterSqls: {
      au: (value: string[]) => Prisma.raw(`date <= ${value[0]}`),
      du: (value: string[]) => Prisma.raw(`date >= ${value[0]}`),
    },
  },
  type: {
    rawOrderBySql: (direction) => Prisma.raw(`type_order ${direction}`),
    rawFilterSqls: {
      type: (value: string[]) => Prisma.raw(`type = ${value[0].toLowerCase()}`),
    },
  },
} satisfies RawDataTableSqlConfiguration<ActivitesDataTableConfiguration>
