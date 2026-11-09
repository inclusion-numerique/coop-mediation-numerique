import type { Prisma } from '@app/web/generated/prisma/client'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { NombreDActivites } from '../../../../domain/nombres'
import { lieuExploitable } from '../../../../implementation'
import { adresseDesColonnes } from '../../../../implementation/prisma/adresse-des-colonnes'
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
    id: LieuId(lieu.id),
    nom: Nom(lieu.nom),
    adresse: adresseDesColonnes(lieu),
    activites: NombreDActivites(lieu.activitesCount),
    lePlusUtilise: rang === 0 && lieu.activitesCount > 0,
  }))
}
