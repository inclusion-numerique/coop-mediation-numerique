import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { ChoisirProfil } from '../../domain/choisir-profil'
import { rolesACreerPourProfil } from '../../domain/choisir-profil'

/**
 * Pose le profil et l'acceptation des CGU sur l'utilisateur courant et garantit
 * le compte de rôle correspondant (idempotent via `connectOrCreate`). Scopé sur
 * l'identifiant fourni par l'action authentifiée.
 */
export const choisirProfil: ChoisirProfil = async ({ userId, profil }) => {
  const roles = rolesACreerPourProfil(profil)

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      profilInscription: profil,
      acceptationCgu: new Date(),
      ...(roles.mediateur
        ? {
            mediateur: {
              connectOrCreate: {
                where: { userId },
                create: { id: v4() },
              },
            },
          }
        : {}),
      ...(roles.coordinateur
        ? {
            coordinateur: {
              connectOrCreate: {
                where: { userId },
                create: { id: v4() },
              },
            },
          }
        : {}),
    },
  })

  return { profil }
}
