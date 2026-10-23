import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  derniereActiviteDe,
  JAMAIS,
  type Jalon,
  jalon,
  rattachements,
} from '../domain'

const situationDActiviteSelect = {
  lastSeen: true,
  mediateur: {
    select: {
      derniereCreationActivite: true,
      derniereCreationBeneficiaire: true,
    },
  },
  coordinateur: {
    select: {
      derniereCreationActivite: true,
      _count: {
        select: { mediateursCoordonnes: { where: { suppression: null } } },
      },
    },
  },
} satisfies Prisma.UserSelect

export const derniereActiviteDeLUtilisateur = async (
  userId: string,
): Promise<Jalon> => {
  const utilisateur = await prismaClient.user.findUnique({
    where: { id: userId },
    select: situationDActiviteSelect,
  })

  return utilisateur === null
    ? JAMAIS
    : derniereActiviteDe({
        rattachements: rattachements(
          utilisateur.mediateur === null
            ? null
            : {
                derniereActivite: jalon(
                  utilisateur.mediateur.derniereCreationActivite,
                ),
                dernierBeneficiaire: jalon(
                  utilisateur.mediateur.derniereCreationBeneficiaire,
                ),
              },
          utilisateur.coordinateur === null
            ? null
            : {
                aUneEquipe:
                  utilisateur.coordinateur._count.mediateursCoordonnes > 0,
                aCoordonne:
                  utilisateur.coordinateur.derniereCreationActivite !== null,
              },
        ),
        derniereVisite: jalon(utilisateur.lastSeen),
      })
}
