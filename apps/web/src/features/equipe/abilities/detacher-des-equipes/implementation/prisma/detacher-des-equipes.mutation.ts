import { prismaClient } from '@app/web/prismaClient'

type Bilan = {
  readonly invitationsSupprimees: number
  readonly appartenancesRetirees: number
}

export const detacherDesEquipes = ({
  mediateurId,
  coordinateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly maintenant?: Date
}): Promise<Bilan> =>
  prismaClient.$transaction(async (transaction) => {
    const proprietaires = [
      ...(mediateurId === null ? [] : [{ mediateurId }]),
      ...(coordinateurId === null ? [] : [{ coordinateurId }]),
    ]

    if (proprietaires.length === 0)
      return { invitationsSupprimees: 0, appartenancesRetirees: 0 }

    const invitations = await transaction.invitationEquipe.deleteMany({
      where: { OR: proprietaires },
    })

    const appartenances = await transaction.mediateurCoordonne.updateMany({
      where: { OR: proprietaires, suppression: null },
      data: { suppression: maintenant },
    })

    return {
      invitationsSupprimees: invitations.count,
      appartenancesRetirees: appartenances.count,
    }
  })
