import { prismaClient } from '@/configuration/prisma'
import type { GarantirLeMediateur } from '@/features/inscription/abilities/initialiser-inscription/domain'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'

export const garantirLeMediateur =
  (synchroniserLaPersonne: SynchroniserLaPersonne): GarantirLeMediateur =>
  async (userId) => {
    const existant = await prismaClient.mediateur.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (existant) return

    await prismaClient.$transaction(async (transaction) => {
      await transaction.mediateur.create({
        data: { userId },
        select: { id: true },
      })
      await synchroniserLaPersonne(transaction, userId)
    })
  }
