import { prismaClient } from '@/configuration/prisma'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { lieuExploitable } from '../../../../implementations/prisma/lieu-exploitable.sql'

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
