import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

const LIMITE = 50

/**
 * Les lieux parmi lesquels choisir celui à fusionner : la recherche ratisse
 * SIRET, dénomination, adresse et commune, chaque mot devant se retrouver
 * quelque part. Les dénominations sont recasées — la base mêle les majuscules
 * de l'annuaire et la saisie des médiateurs.
 */
export const lieuxAFusionner = async (query: string) => {
  const structuresSearchLimit = LIMITE
  const queryParts = query.split(' ')

  const matchesWhere = {
    suppression: null,
    AND: queryParts.map((part) => ({
      OR: [
        {
          siret: {
            contains: part,
            mode: 'insensitive',
          },
        },
        {
          nom: {
            contains: part,
            mode: 'insensitive',
          },
        },
        {
          adresse: {
            contains: part,
            mode: 'insensitive',
          },
        },
        {
          commune: {
            contains: part,
            mode: 'insensitive',
          },
        },
      ],
    })),
  } satisfies Prisma.LieuInclusionWhereInput

  const structuresRaw = await prismaClient.lieuInclusion.findMany({
    where: matchesWhere,
    take: structuresSearchLimit,
    orderBy: {
      nom: 'asc',
    },
  })

  const matchesCount = await prismaClient.lieuInclusion.count({
    where: matchesWhere,
  })

  const structures = structuresRaw.map(
    ({ nom, adresse, commune, ...rest }) => ({
      nom: toTitleCase(nom, { noUpper: true }),
      commune: toTitleCase(commune),
      adresse: toTitleCase(adresse, { noUpper: true }),
      ...rest,
    }),
  )

  return {
    structures,
    matchesCount,
    moreResults: Math.max(matchesCount - structuresSearchLimit, 0),
  }
}

export type LieuxAFusionnerTrouves = Awaited<ReturnType<typeof lieuxAFusionner>>

export type LieuTrouve = LieuxAFusionnerTrouves['structures'][number]
