import { prismaClient } from '@/configuration/prisma'
import { MediateurId, UtilisateurId } from '@/features/mediateurs/domain'
import type { LireLeMediateurARegler } from '../../domain/ports'

export const lireLeMediateurARegler: LireLeMediateurARegler = async (
  mediateurId,
) => {
  const mediateur = await prismaClient.mediateur.findFirst({
    where: { id: mediateurId, user: { deleted: null } },
    select: { id: true, userId: true },
  })

  return mediateur === null
    ? null
    : {
        id: MediateurId(mediateur.id),
        utilisateurId: UtilisateurId(mediateur.userId),
      }
}
