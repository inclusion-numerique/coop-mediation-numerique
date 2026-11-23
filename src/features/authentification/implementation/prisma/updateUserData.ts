import { prismaClient } from '@/configuration/prisma/prismaClient'
import type { SynchroniserLaPersonne } from '@/features/authentification/implementation/prisma/synchroniser-la-personne'
import { telephoneEnregistrable } from '@/libraries/telephone'

export const updateUserData =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async ({
    userId,
    firstName,
    lastName,
    phone,
    siret,
  }: {
    userId: string
    firstName: string
    lastName: string
    phone: string | null
    siret?: string | null
  }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.user.update({
        data: {
          firstName,
          lastName,
          phone: telephoneEnregistrable(phone),
          name: `${firstName} ${lastName}`,
          siret: siret ?? undefined,
          updated: new Date(),
        },
        where: {
          id: userId,
        },
      })
      await synchroniserLaPersonne(transaction, userId)
    })
  }
