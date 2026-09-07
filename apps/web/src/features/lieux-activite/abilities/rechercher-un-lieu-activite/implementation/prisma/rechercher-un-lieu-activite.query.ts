import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type { MediateurId } from '../../../../domain/mediateur-id'

/**
 * Un lieu tel qu'il s'affiche dans une liste de suggestions : de quoi le
 * reconnaître, et de quoi signaler celui où le médiateur travaille le plus.
 */
export type LieuActiviteTrouve = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly activites: number
  readonly lePlusUtilise: boolean
}

/**
 * La recherche ne porte que sur les lieux où le médiateur exerce : c'est un
 * choix parmi les siens, pas une exploration de l'annuaire.
 *
 * L'ordre met en tête le lieu le plus utilisé, parce qu'une saisie de compte
 * rendu y revient presque toujours.
 */
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
