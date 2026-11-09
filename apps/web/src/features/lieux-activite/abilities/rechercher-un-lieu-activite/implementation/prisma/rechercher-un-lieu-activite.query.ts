import type { Prisma } from '@app/web/generated/prisma/client'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { lieuExploitable } from '../../../../implementation'
import type { LieuActiviteTrouve } from '../../domain'

export const rechercherUnLieuActivite = async ({
  mediateurId,
  recherche,
}: {
  mediateurId: MediateurId
  recherche: string
}): Promise<readonly LieuActiviteTrouve[]> => {
  const where = {
    mediateurId,
    suppression: null,
    fin: null,
    lieuInclusion: lieuExploitable,
    AND: toQueryParts({ recherche }).map((part) => ({
      OR: [{ lieuInclusion: { nom: { contains: part, mode: 'insensitive' } } }],
    })),
  } satisfies Prisma.MediateurEnActiviteWhereInput

  const rattachements = await prismaClient.mediateurEnActivite.findMany({
    where,
    select: {
      lieuInclusion: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          commune: true,
          codePostal: true,
          activitesCount: true,
        },
      },
    },
    orderBy: [
      { lieuInclusion: { activitesCount: 'desc' } },
      { lieuInclusion: { nom: 'asc' } },
    ],
  })

  return rattachements.map(({ lieuInclusion: lieu }, rang) => ({
    id: lieu.id,
    nom: lieu.nom,
    adresse: `${lieu.adresse}, ${lieu.codePostal} ${lieu.commune}`,
    activites: lieu.activitesCount,
    lePlusUtilise: rang === 0 && lieu.activitesCount > 0,
  }))
}
