import { prismaClient } from '@app/web/prismaClient'
import { CoordinateurId, MediateurId } from '../../../../domain'
import {
  libererLesTagsDuCoordinateur,
  libererLesTagsDuMediateur,
} from './liberer-les-tags.mutation'

type Bilan = {
  readonly invitationsSupprimees: number
  readonly appartenancesSupprimees: number
  readonly tagsTransferes: number
  readonly tagsSupprimes: number
}

const aucunTag = { transferes: 0, supprimes: 0 }

/**
 * Détache un compte de tout ce qui l'attache à une équipe.
 *
 * Un seul port, et non trois, parce que l'ORDRE compte : les tags d'un médiateur
 * ne peuvent revenir à son coordinateur qu'avant que le lien de coordination ne
 * soit coupé. C'est un invariant qu'un appelant extérieur ne saurait pas tenir,
 * donc il vit ici.
 *
 * Idempotent : chaque écriture est filtrée sur ce qui est encore vivant.
 */
export const libererDesEquipes = ({
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
        : await libererLesTagsDuMediateur(
            transaction,
            MediateurId(mediateurId),
            maintenant,
          )

    const tagsCoordinateur =
      coordinateurId === null
        ? aucunTag
        : await libererLesTagsDuCoordinateur(
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
        : await transaction.mediateurCoordonne.deleteMany({
            where: { OR: proprietaires },
          })

    return {
      invitationsSupprimees: invitations.count,
      appartenancesSupprimees: appartenances.count,
      tagsTransferes: tagsMediateur.transferes + tagsCoordinateur.transferes,
      tagsSupprimes: tagsMediateur.supprimes + tagsCoordinateur.supprimes,
    }
  })
