import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const searchStructureSelect = {
  id: true,
  nom: true,
  adresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  siret: true,
  typologies: true,
  visiblePourCartographieNationale: true,
  structureCartographieNationaleId: true,
  creation: true,
  modification: true,
  suppression: true,
  _count: {
    select: {
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
          mediateur: { user: { deleted: null } },
        },
      },
      activites: {
        where: {
          suppression: null,
        },
      },
    },
  },
} satisfies Prisma.LieuInclusionSelect

/**
 * Les colonnes de la liste d'administration, et ce que chaque lieu porte
 * d'activité : médiateurs en exercice, activités, emplois.
 */
export const lieuxPourLaListe = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.LieuInclusionWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.LieuInclusionOrderByWithRelationInput[]
}) => {
  const structures = await prismaClient.lieuInclusion.findMany({
    where,
    take,
    skip,
    select: searchStructureSelect,
    orderBy: [...(orderBy ?? []), { nom: 'asc' }],
  })

  // L'employeuse n'est plus reliée au lieu (ADR-002) : ce compteur n'a plus de
  // quoi se calculer et vaut zéro pour tout le monde.
  return structures.map((structure) => ({ ...structure, emploisCount: 0 }))
}

export type LieuDeLaListe = Awaited<ReturnType<typeof lieuxPourLaListe>>[number]
