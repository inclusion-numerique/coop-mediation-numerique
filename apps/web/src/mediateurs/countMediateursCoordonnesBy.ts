import { prismaClient } from '@app/web/prismaClient'
import { subMonths } from 'date-fns'

export const countMediateursCoordonnesBy = async (
  coordinateur?: { id: string } | null,
): Promise<{
  total: number
  totalAncien: number
  conseillersNumeriques: number
  mediateursNumeriques: number
  actifs: number
  inactifs: number
  invitations: number
  archives: number
}> => {
  if (!coordinateur?.id) {
    return {
      total: 0,
      totalAncien: 0,
      conseillersNumeriques: 0,
      mediateursNumeriques: 0,
      actifs: 0,
      inactifs: 0,
      invitations: 0,
      archives: 0,
    }
  }

  const twoMonthsAgo = subMonths(new Date(), 2)

  const [
    total,
    totalAncien,
    conseillersNumeriques,
    invitations,
    actifs,
    inactifs,
    archives,
  ] = await Promise.all([
    prismaClient.mediateurCoordonne.count({
      where: { coordinateurId: coordinateur.id, suppression: null },
    }),
    prismaClient.mediateurCoordonne.count({
      where: { coordinateurId: coordinateur.id, suppression: { not: null } },
    }),
    prismaClient.mediateurCoordonne.count({
      where: {
        coordinateurId: coordinateur.id,
        suppression: null,
        mediateur: { conseillerNumerique: { isNot: null } },
      },
    }),
    prismaClient.invitationEquipe.count({
      where: {
        coordinateurId: coordinateur.id,
        acceptee: null,
        refusee: null,
      },
    }),
    prismaClient.mediateurCoordonne.count({
      where: {
        coordinateurId: coordinateur.id,
        suppression: null,
        mediateur: {
          user: { deleted: null },
          derniereCreationActivite: { gte: twoMonthsAgo },
        },
      },
    }),
    prismaClient.mediateurCoordonne.count({
      where: {
        coordinateurId: coordinateur.id,
        suppression: null,
        mediateur: {
          user: { deleted: null },
          OR: [
            { derniereCreationActivite: null },
            { derniereCreationActivite: { lt: twoMonthsAgo } },
          ],
        },
      },
    }),
    prismaClient.mediateurCoordonne.count({
      where: {
        coordinateurId: coordinateur.id,
        OR: [
          { suppression: { not: null } },
          { mediateur: { user: { deleted: { not: null } } } },
        ],
      },
    }),
  ])

  return {
    total,
    totalAncien,
    conseillersNumeriques,
    mediateursNumeriques: total - conseillersNumeriques,
    actifs,
    inactifs,
    invitations,
    archives,
  }
}
