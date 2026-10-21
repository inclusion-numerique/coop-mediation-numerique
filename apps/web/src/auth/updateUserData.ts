import { telephoneEnregistrable } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

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
  await prismaClient.user.update({
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
}
