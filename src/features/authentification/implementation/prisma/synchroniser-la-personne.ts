import type { Prisma } from '@/generated/prisma/client'

export type SynchroniserLaPersonne = (
  transaction: Prisma.TransactionClient,
  utilisateurId: string,
) => Promise<unknown>
