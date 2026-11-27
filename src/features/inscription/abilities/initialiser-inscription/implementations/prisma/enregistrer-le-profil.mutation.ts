import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLeProfil } from '@/features/inscription/abilities/initialiser-inscription/domain'

export const enregistrerLeProfil: EnregistrerLeProfil = async ({
  userId,
  profil,
}) => {
  await prismaClient.user.update({
    where: { id: userId },
    data: { profilInscription: profil },
    select: { id: true },
  })
}
