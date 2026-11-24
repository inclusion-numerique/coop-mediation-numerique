import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { SynchroniserLaPersonne } from '@/features/authentification/implementations/prisma/synchroniser-la-personne.mutation'
import { telephoneEnregistrable } from '@/libraries/telephone'

export const enregistrerLesDonneesDeLUtilisateur =
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
          ...(siret == null ? {} : { siret }),
          updated: new Date(),
        },
        where: {
          id: userId,
        },
      })
      await synchroniserLaPersonne(transaction, userId)
    })
  }
