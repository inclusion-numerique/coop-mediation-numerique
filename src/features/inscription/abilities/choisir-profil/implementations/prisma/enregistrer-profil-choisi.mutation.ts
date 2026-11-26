import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { inscriptionEtatFromDomain } from '@/features/inscription/implementations/prisma/inscription-etat.transfer'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'
import type { EnregistrerProfilChoisi } from '../../domain'

export const enregistrerProfilChoisi =
  (synchroniserLaPersonne: SynchroniserLaPersonne): EnregistrerProfilChoisi =>
  async ({ etat, roles }) => {
    const { userId } = etat

    await prismaClient.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: userId },
        data: {
          ...inscriptionEtatFromDomain(etat),
          ...(roles.mediateur
            ? {
                mediateur: {
                  connectOrCreate: { where: { userId }, create: { id: v4() } },
                },
              }
            : {}),
          ...(roles.coordinateur
            ? {
                coordinateur: {
                  connectOrCreate: { where: { userId }, create: { id: v4() } },
                },
              }
            : {}),
        },
      })
      await synchroniserLaPersonne(transaction, userId)
    })
  }
