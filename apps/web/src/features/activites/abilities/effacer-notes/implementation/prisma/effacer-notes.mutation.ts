import { prismaClient } from '@app/web/prismaClient'
import type { CoordinateurId, MediateurId } from '../../../../domain'

export const effacerNotes = async ({
  mediateurId,
  coordinateurId,
}: {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}): Promise<{ readonly effacees: number }> => {
  const activites =
    mediateurId === null
      ? { count: 0 }
      : await prismaClient.activite.updateMany({
          where: { mediateurId, notes: { not: null } },
          data: { notes: null },
        })

  const coordination =
    coordinateurId === null
      ? { count: 0 }
      : await prismaClient.activiteCoordination.updateMany({
          where: { coordinateurId, notes: { not: null } },
          data: { notes: null },
        })

  return { effacees: activites.count + coordination.count }
}
