import { prismaClient } from '@/configuration/prisma'
import type { LireEtatPourEtapeSuivante } from '@/features/inscription/abilities/initialiser-inscription/domain'
import { ProfilInscription } from '@/features/inscription/domain'

export const lireEtatPourEtapeSuivante: LireEtatPourEtapeSuivante = async (
  userId,
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      profilInscription: true,
      mediateur: {
        select: {
          _count: {
            select: { enActivite: { where: { suppression: null, fin: null } } },
          },
        },
      },
    },
  })

  return {
    profil: user?.profilInscription
      ? ProfilInscription(user.profilInscription)
      : null,
    hasLieuxActivite: (user?.mediateur?._count.enActivite ?? 0) > 0,
  }
}
