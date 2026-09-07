import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

/**
 * Les lieux que la coop connaît déjà, cherchés mot à mot sur ce qui permet de
 * les reconnaître : immatriculation, nom, adresse, commune.
 *
 * La ligne est rendue telle quelle. La mise en forme — la casse des noms, le
 * préfixe qui distingue une source d'une autre — appartient à celui qui réunit
 * les trois sources, pas à la requête.
 */
export const lieuxDeLaCoop = async (
  recherche: string,
  { limite }: { limite: number },
) => {
  const mots = recherche.split(' ')

  const correspondances = {
    suppression: null,
    AND: mots.map((mot) => ({
      OR: [
        { siret: { contains: mot, mode: 'insensitive' } },
        { nom: { contains: mot, mode: 'insensitive' } },
        { adresse: { contains: mot, mode: 'insensitive' } },
        { commune: { contains: mot, mode: 'insensitive' } },
      ],
    })),
  } satisfies Prisma.LieuInclusionWhereInput

  const [lignes, matchesCount] = await Promise.all([
    prismaClient.lieuInclusion.findMany({
      where: correspondances,
      take: limite,
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        adresse: true,
        commune: true,
        codePostal: true,
        codeInsee: true,
        complementAdresse: true,
        siret: true,
        typologies: true,
        latitude: true,
        longitude: true,
      },
    }),
    prismaClient.lieuInclusion.count({ where: correspondances }),
  ])

  return { lignes, matchesCount }
}
