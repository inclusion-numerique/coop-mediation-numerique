import type { Sort } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { RattachementId } from '../../../../domain/identifiants/rattachement-id'
import type { ColonneDesLieux } from '../../../../domain/tri-des-lieux'
import {
  lieuEnListe,
  projectionDuLieuEnListe,
} from '../../../../implementations/prisma/lieu-en-liste.select'
import type { LieuDuMediateurEnListe } from '../../domain'

export const listerLesLieuxDuMediateur = async ({
  mediateurId,
  tri,
}: {
  mediateurId: MediateurId
  tri: Sort<ColonneDesLieux>
}): Promise<LieuDuMediateurEnListe[]> => {
  const orderBy: Prisma.MediateurEnActiviteOrderByWithRelationInput = {
    lieuInclusion: { [tri.field]: tri.direction },
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
