import { prismaClient } from '@/configuration/prisma'
import type { CompteRattache } from '../../domain/detachement'
import type { RetirerDesEquipes } from '../../domain/ports'

const proprietairesDu = (compte: CompteRattache) => {
  if (compte._tag === 'Mediateur') return [{ mediateurId: compte.mediateurId }]
  if (compte._tag === 'Coordinateur')
    return [{ coordinateurId: compte.coordinateurId }]
  return [
    { mediateurId: compte.mediateurId },
    { coordinateurId: compte.coordinateurId },
  ]
}

export const retirerDesEquipes: RetirerDesEquipes = ({ compte, retireesLe }) =>
  prismaClient.$transaction(async (transaction) => {
    const proprietaires = proprietairesDu(compte)

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
