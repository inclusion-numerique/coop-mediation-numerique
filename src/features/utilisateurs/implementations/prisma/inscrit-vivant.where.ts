import type { Prisma } from '@/generated/prisma/client'

export const inscritVivantWhere = {
  deleted: null,
  inscriptionValidee: { not: null },
} satisfies Prisma.UserWhereInput
