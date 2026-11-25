import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { motsDe } from '@/libraries/texte'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { NombreDActivites } from '../../../../domain/nombres'
import { adresseDesColonnes } from '../../../../implementations/prisma/adresse-des-colonnes.select'
import { lieuExploitable } from '../../../../implementations/prisma/lieu-exploitable.sql'
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
    AND: motsDe(recherche ?? '').map((part) => ({
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
