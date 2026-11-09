import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { SuggestionDeLieu } from '../../../../domain/suggestion-de-lieu'
import { lieuExploitable } from '../../../../implementation'
import type { ChercherDansLaCoop } from '../../domain/ports'

export const lieuxDeLaCoop = async (
  recherche: string,
  { limite }: { limite: number },
) => {
  const mots = recherche.split(' ')

  const correspondances = {
    ...lieuExploitable,
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

export const chercherDansLaCoop: ChercherDansLaCoop = async (
  recherche,
  limite,
) => {
  const { lignes, matchesCount } = await lieuxDeLaCoop(recherche, { limite })

  return {
    suggestions: lignes.map(
      (lieu): SuggestionDeLieu => ({
        id: `structure_${lieu.id}`,
        nom: toTitleCase(lieu.nom, { noUpper: true }),
        adresse: toTitleCase(lieu.adresse ?? '', { noUpper: true }),
        commune: toTitleCase(lieu.commune ?? ''),
        codePostal: lieu.codePostal ?? '',
        codeInsee: lieu.codeInsee,
        complementAdresse: lieu.complementAdresse,
        pivot: lieu.siret ?? undefined,
        typologie: lieu.typologies?.join(';') || null,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
        structures: [{ id: lieu.id }],
        source: 'structure_locale',
      }),
    ),
    nombre: matchesCount,
  }
}
