import type { LireEtatPourEtapeSuivante } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import { prismaClient } from '@app/web/prismaClient'

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
