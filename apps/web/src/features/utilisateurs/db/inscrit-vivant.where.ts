import type { Prisma } from '@app/web/generated/prisma/client'

export const inscritVivantWhere = {
  deleted: null,
  inscriptionValidee: { not: null },
} satisfies Prisma.UserWhereInput
