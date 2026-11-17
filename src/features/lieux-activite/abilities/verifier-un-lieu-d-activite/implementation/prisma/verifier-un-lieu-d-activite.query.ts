import { prismaClient } from '@app/web/prismaClient'
import type { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { lieuExploitable } from '../../../../implementation/prisma/lieu-exploitable'

export const verifierUnLieuDActivite = async ({
  lieuId,
  mediateurId,
  lieuActuel,
}: {
  readonly lieuId: LieuId
  readonly mediateurId: MediateurId
  readonly lieuActuel: LieuId | null
}): Promise<boolean> => {
  if (lieuId === lieuActuel) return true
  const lieu = await prismaClient.lieuInclusion.findFirst({
    where: {
      id: lieuId,
      ...lieuExploitable,
      mediateursEnActivite: {
        some: { mediateurId, suppression: null, fin: null },
      },
    },
    select: { id: true },
  })
  return lieu !== null
}
