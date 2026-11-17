import { prismaClient } from '@app/web/prismaClient'
import type { CoordinateurId, MediateurId } from '../../../../domain'
import type { AdhesionLue } from '../../domain'

export const lireLesLiensDEquipe = async (
  coordinateurId: CoordinateurId,
  mediateurId: MediateurId,
): Promise<{
  readonly adhesions: readonly AdhesionLue[]
  readonly invitationEnCours: Date | null
}> => {
  const [adhesions, invitation] = await Promise.all([
    prismaClient.mediateurCoordonne.findMany({
      where: { coordinateurId, mediateurId },
      select: { creation: true, suppression: true },
    }),
    prismaClient.invitationEquipe.findFirst({
      where: { coordinateurId, mediateurId, acceptee: null, refusee: null },
      orderBy: { creation: 'desc' },
      select: { creation: true },
    }),
  ])

  return {
    adhesions: adhesions.map(({ creation, suppression }) =>
      suppression === null
        ? { _tag: 'EnCours' }
        : { _tag: 'Terminee', debut: creation, fin: suppression },
    ),
    invitationEnCours: invitation?.creation ?? null,
  }
}
