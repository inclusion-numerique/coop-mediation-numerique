import { conseillerNumeriqueWhere } from '@app/web/features/employeuse/server'
import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'

const UN_JOUR = 24 * 60 * 60 * 1000

const doubleRoleHorsDispositifInscritDepuis = (
  maintenant: Date,
): Prisma.UserWhereInput => ({
  role: 'User',
  deleted: null,
  mediateur: { isNot: null },
  coordinateur: { isNot: null },
  ...conseillerNumeriqueWhere(false),
  inscriptionValidee: { lte: new Date(maintenant.getTime() - 30 * UN_JOUR) },
})

const identifiants = (lignes: readonly { id: string }[]) =>
  lignes.map(({ id }) => UtilisateurId(id))

export const rolesVacants = async (maintenant: Date) => {
  const base = doubleRoleHorsDispositifInscritDepuis(maintenant)

  const [coordinateursVacants, mediateursVacants] = await Promise.all([
    prismaClient.user.findMany({
      select: { id: true },
      where: {
        AND: [
          base,
          {
            coordinateur: {
              is: {
                mediateursCoordonnes: { none: {} },
                ActiviteCoordination: { none: {} },
                invitations: { none: {} },
              },
            },
          },
        ],
      },
    }),
    prismaClient.user.findMany({
      select: { id: true },
      where: {
        AND: [
          base,
          {
            mediateur: {
              is: {
                enActivite: { none: {} },
                beneficiaires: { none: {} },
                activites: { none: {} },
              },
            },
          },
        ],
      },
    }),
  ])

  return {
    coordinateursVacants: identifiants(coordinateursVacants),
    mediateursVacants: identifiants(mediateursVacants),
  }
}
