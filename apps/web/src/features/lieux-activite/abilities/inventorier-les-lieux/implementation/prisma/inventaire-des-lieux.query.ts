import { getEmploisCountByCorrelation } from '@app/web/features/structures/correlateStructureAdministrative'
import { prismaClient } from '@app/web/prismaClient'

/**
 * L'inventaire des lieux, tel que les clients d'API le parcourent.
 *
 * Deux différences avec ce que publie la cartographie : on rend TOUT, y compris
 * les lieux supprimés — un client qui tient un miroir a besoin de savoir qu'une
 * ligne a disparu, et son horodatage de suppression est la seule façon de le
 * lui dire —, et on ne filtre pas sur la visibilité, qui ne regarde que la
 * carte.
 *
 * L'ordre est celui du curseur : création décroissante, l'identifiant
 * départageant les créations simultanées.
 */
export const inventaireDesLieux = async ({
  ids,
  creeDepuis,
  modifieDepuis,
  take,
  skip,
  curseur,
}: {
  readonly ids: readonly string[]
  readonly creeDepuis?: Date
  readonly modifieDepuis?: Date
  readonly take: number
  readonly skip?: number
  readonly curseur?: { readonly creation: string; readonly id: string }
}) => {
  const where = {
    ...(ids.length > 0 ? { id: { in: [...ids] } } : {}),
    ...(creeDepuis ? { creation: { gte: creeDepuis } } : {}),
    ...(modifieDepuis ? { modification: { gte: modifieDepuis } } : {}),
  }

  const lieux = await prismaClient.lieuInclusion.findMany({
    orderBy: [{ creation: 'desc' }, { id: 'desc' }],
    take,
    skip,
    where,
    include: {
      _count: {
        select: {
          mediateursEnActivite: { where: { suppression: null, fin: null } },
        },
      },
    },
    cursor: curseur
      ? { creation_id: { creation: curseur.creation, id: curseur.id } }
      : undefined,
  })

  const totalCount = await prismaClient.lieuInclusion.count({ where })

  // Compteur d'emplois par corrélation nom + code INSEE avec l'employeuse
  // (structure_administrative) ; pas de lien FK.
  const emploisParLieu = await getEmploisCountByCorrelation(lieux, {
    activeOnly: true,
  })

  return { lieux, totalCount, emploisParLieu }
}

export type LieuInventorie = Awaited<
  ReturnType<typeof inventaireDesLieux>
>['lieux'][number]
