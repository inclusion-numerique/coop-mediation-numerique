import { prismaClient } from '@/configuration/prisma'
import type { AdhesionLue, LireLesLiensDEquipe } from '../../domain'

export const lireLesLiensDEquipe: LireLesLiensDEquipe = async (
  coordinateurId,
  mediateurId,
) => {
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
    adhesions: adhesions.map(
      ({ creation, suppression }): AdhesionLue =>
        suppression === null
          ? { _tag: 'EnCours' }
          : { _tag: 'Terminee', debut: creation, fin: suppression },
    ),
    invitationEnCours: invitation?.creation ?? null,
  }
}
