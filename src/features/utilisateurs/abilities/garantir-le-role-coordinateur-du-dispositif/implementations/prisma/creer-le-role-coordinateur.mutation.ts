import { prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'

export const creerLeRoleCoordinateur =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async (userId: string): Promise<void> => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.coordinateur.create({
        data: { userId },
        select: { id: true },
      })
      await synchroniserLaPersonne(transaction, userId)
    })
  }
