import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { EnregistrerProfilChoisi } from '../../domain'

/**
 * Projette l'état d'inscription sur la ligne `user` et garantit le compte de
 * rôle correspondant (idempotent via `connectOrCreate`) — un seul update, donc
 * jamais de profil posé sans son compte de rôle. Les colonnes d'inscription
 * viennent toutes du transfer : l'implémentation n'en compose aucune à la main.
 */
export const enregistrerProfilChoisi: EnregistrerProfilChoisi = async ({
  etat,
  roles,
}) => {
  const { userId } = etat

  await prismaClient.user.update({
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
}
