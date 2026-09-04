import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { Prisma } from '@app/web/generated/entrepot'
import { toTitleCase } from '@app/web/utils/toTitleCase'

type SearchStructureCartographieNationaleOptions = {
  limit?: number
  // Ids cartographie nationale (structure_cartographie_nationale_id) à exclure
  except?: string[]
}

// Recherche dans les lieux de la cartographie nationale (main.lieu_inclusion, Entrepôt),
// PAR NOM / ADRESSE / COMMUNE uniquement. Le SIRET n'est volontairement pas exposé :
// la cartographie nationale n'en est pas une source fiable (seule l'API entreprise fait foi).
export const searchStructureCartographieNationale = async (
  query: string,
  options?: SearchStructureCartographieNationaleOptions,
) => {
  const structuresSearchLimit = options?.limit || 50
  const queryParts = query.split(' ').filter(Boolean)
  const except = options?.except ?? []

  const matchesWhere = {
    structureCartographieNationaleId:
      except.length > 0 ? { not: null, notIn: except } : { not: null },
    AND: queryParts.map((part) => ({
      OR: [
        { nom: { contains: part, mode: 'insensitive' } },
        { adresse: { nomVoie: { contains: part, mode: 'insensitive' } } },
        { adresse: { nomCommune: { contains: part, mode: 'insensitive' } } },
      ],
    })),
  } satisfies Prisma.LieuInclusionWhereInput

  const [lieux, matchesCount] = await Promise.all([
    entrepotPrismaClient.lieuInclusion.findMany({
      where: matchesWhere,
      take: structuresSearchLimit,
      orderBy: { nom: 'asc' },
      select: {
        structureCartographieNationaleId: true,
        structureCoopId: true,
        nom: true,
        typologies: true,
        adresse: {
          select: {
            numeroVoie: true,
            repetition: true,
            nomVoie: true,
            nomCommune: true,
            codePostal: true,
            codeInsee: true,
          },
        },
      },
    }),
    entrepotPrismaClient.lieuInclusion.count({ where: matchesWhere }),
  ])

  const structures = lieux.flatMap((lieu) =>
    lieu.structureCartographieNationaleId == null
      ? []
      : [
          {
            id: lieu.structureCartographieNationaleId,
            nom: toTitleCase(lieu.nom, { noUpper: true }),
            adresse: toTitleCase(
              [
                [lieu.adresse?.numeroVoie, lieu.adresse?.repetition]
                  .filter(Boolean)
                  .join(''),
                lieu.adresse?.nomVoie,
              ]
                .filter(Boolean)
                .join(' '),
              { noUpper: true },
            ),
            commune: toTitleCase(lieu.adresse?.nomCommune ?? ''),
            codePostal: lieu.adresse?.codePostal ?? '',
            codeInsee: lieu.adresse?.codeInsee ?? null,
            complementAdresse: null as string | null,
            // SIRET non exposé (non fiable côté carto)
            pivot: undefined as string | undefined,
            typologie:
              lieu.typologies.length > 0 ? lieu.typologies.join(';') : null,
            latitude: null as number | null,
            longitude: null as number | null,
            structures: lieu.structureCoopId
              ? [{ id: lieu.structureCoopId }]
              : [],
          },
        ],
  )

  return {
    structures,
    matchesCount,
    moreResults: Math.max(matchesCount - structuresSearchLimit, 0),
  }
}

export type SearchStructureCartographieNationaleResult = Awaited<
  ReturnType<typeof searchStructureCartographieNationale>
>

export type SearchStructureCartographieNationaleResultStructure =
  SearchStructureCartographieNationaleResult['structures'][number]
