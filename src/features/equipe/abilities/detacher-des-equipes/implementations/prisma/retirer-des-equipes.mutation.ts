import { prismaClient } from '@/configuration/prisma'
import type { RetirerDesEquipes } from '../../domain/ports'

export const retirerDesEquipes: RetirerDesEquipes = ({
  mediateurId,
  coordinateurId,
  retireesLe,
}) =>
  prismaClient.$transaction(async (transaction) => {
    const proprietaires = [
      ...(mediateurId === null ? [] : [{ mediateurId }]),
      ...(coordinateurId === null ? [] : [{ coordinateurId }]),
    ]

    const invitations = await transaction.invitationEquipe.deleteMany({
      where: { OR: proprietaires },
    })

    const appartenances = await transaction.mediateurCoordonne.updateMany({
      where: { OR: proprietaires, suppression: null },
      data: { suppression: retireesLe },
    })

    return {
      invitationsSupprimees: invitations.count,
      appartenancesRetirees: appartenances.count,
    }
  })
