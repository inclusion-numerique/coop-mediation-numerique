import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { RattachementId } from '../../../../domain/rattachement-id'
import {
  ordonnancement,
  type TriDesLieux,
} from '../../../../domain/tri-des-lieux'
import {
  lieuEnListe,
  projectionDuLieuEnListe,
} from '../../../../implementation/prisma/lieu-en-liste'
import type { LieuDuMediateurEnListe } from '../../domain'

export const listerLesLieuxDuMediateur = async ({
  mediateurId,
  tri,
}: {
  mediateurId: MediateurId
  tri: TriDesLieux
}): Promise<LieuDuMediateurEnListe[]> => {
  const { champ, sens } = ordonnancement(tri)
  const orderBy: Prisma.MediateurEnActiviteOrderByWithRelationInput = {
    lieuInclusion: { [champ]: sens },
  }

  const rattachements = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateurId, suppression: null, fin: null },
    select: {
      id: true,
      debut: true,
      lieuInclusion: { select: projectionDuLieuEnListe },
    },
    orderBy,
  })

  return rattachements.map(({ id, debut, lieuInclusion }) => ({
    id: RattachementId(id),
    debut,
    lieuInclusion: lieuEnListe(lieuInclusion),
  }))
}
