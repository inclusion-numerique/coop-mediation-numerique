import { prismaClient } from '@app/web/prismaClient'
import { CoordinateurId, MediateurId } from '../../../../domain'
import {
  detacherLesTagsDuCoordinateur,
  detacherLesTagsDuMediateur,
} from './detacher-les-tags'

type Bilan = {
  readonly invitationsSupprimees: number
  readonly appartenancesRetirees: number
  readonly tagsTransferes: number
  readonly tagsSupprimes: number
}

const aucunTag = { transferes: 0, supprimes: 0 }

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
    const tagsMediateur =
      mediateurId === null
        ? aucunTag
        : await detacherLesTagsDuMediateur(
            transaction,
            MediateurId(mediateurId),
            maintenant,
          )

    const tagsCoordinateur =
      coordinateurId === null
        ? aucunTag
        : await detacherLesTagsDuCoordinateur(
            transaction,
            CoordinateurId(coordinateurId),
            maintenant,
          )

    const proprietaires = [
      ...(mediateurId === null ? [] : [{ mediateurId }]),
      ...(coordinateurId === null ? [] : [{ coordinateurId }]),
    ]

    const invitations =
      proprietaires.length === 0
        ? { count: 0 }
        : await transaction.invitationEquipe.deleteMany({
            where: { OR: proprietaires },
          })

    const appartenances =
      proprietaires.length === 0
        ? { count: 0 }
        : await transaction.mediateurCoordonne.updateMany({
            where: { OR: proprietaires, suppression: null },
            data: { suppression: maintenant },
          })

    return {
      invitationsSupprimees: invitations.count,
      appartenancesRetirees: appartenances.count,
      tagsTransferes: tagsMediateur.transferes + tagsCoordinateur.transferes,
      tagsSupprimes: tagsMediateur.supprimes + tagsCoordinateur.supprimes,
    }
  })
