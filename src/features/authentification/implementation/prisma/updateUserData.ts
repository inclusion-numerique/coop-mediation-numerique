import { prismaClient } from '@/configuration/prisma/prismaClient'
import { telephoneEnregistrable } from '@/features/utilisateurs/domain'
import { synchroniserPersonne } from '@/libraries/registre-personne'

export const updateUserData = async ({
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
    await synchroniserPersonne(transaction, userId)
  })
}
