import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
import { prismaClient } from '@app/web/prismaClient'
import { searchStructureCartographieNationale } from '@app/web/structure/searchStructureCartographieNationale'
import { structureCreationDataWithSiretFromUniteLegale } from '@app/web/structure/structuresInfoFromUniteLegale'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

export type LieuActiviteSearchResult = {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  complementAdresse: string | null
  pivot: string | undefined // SIRET
  typologie: string | null
  latitude: number | null
  longitude: number | null
  structures: { id: string }[]
  source: 'cartographie_nationale' | 'structure_locale' | 'api'
}

type SearchLieuActiviteCombinedOptions = {
  limit?: number
  except?: string[]
}

const searchLocalStructures = async (
  query: string,
  options?: { limit?: number; exceptSirets?: Set<string> },
) => {
  const limit = options?.limit || 25
  const queryParts = query.split(' ')

  const matchesWhere = {
    suppression: null,
    structureCartographieNationaleId: null,
    AND: queryParts.map((part) => ({
      OR: [
        { siret: { contains: part, mode: 'insensitive' } },
        { nom: { contains: part, mode: 'insensitive' } },
        { adresse: { contains: part, mode: 'insensitive' } },
        { commune: { contains: part, mode: 'insensitive' } },
      ],
    })),
  } satisfies Prisma.StructureWhereInput

  const structuresRaw = await prismaClient.structure.findMany({
    where: matchesWhere,
    take: limit,
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
  })

  const matchesCount = await prismaClient.structure.count({
    where: matchesWhere,
  })

  const exceptSirets = options?.exceptSirets || new Set<string>()

  const structures: LieuActiviteSearchResult[] = structuresRaw
    .filter((s) => !s.siret || !exceptSirets.has(s.siret))
    .map((structure) => ({
      id: `structure_${structure.id}`,
      nom: toTitleCase(structure.nom, { noUpper: true }),
      adresse: toTitleCase(structure.adresse ?? '', { noUpper: true }),
      commune: toTitleCase(structure.commune ?? ''),
      codePostal: structure.codePostal ?? '',
      codeInsee: structure.codeInsee,
      complementAdresse: structure.complementAdresse,
      pivot: structure.siret ?? undefined,
      typologie: structure.typologies?.join(';') || null,
      latitude: structure.latitude,
      longitude: structure.longitude,
      structures: [{ id: structure.id }],
      source: 'structure_locale' as const,
    }))

  return { structures, matchesCount }
}

export const searchLieuActiviteCombined = async (
  query: string,
  options?: SearchLieuActiviteCombinedOptions,
): Promise<{
  structures: LieuActiviteSearchResult[]
  matchesCount: number
  moreResults: number
  apiUnavailable: boolean
}> => {
  if (query.length < 3) {
    return {
      structures: [],
      matchesCount: 0,
      moreResults: 0,
      apiUnavailable: false,
    }
  }

  const limit = options?.limit || 50
  const perSourceLimit = Math.ceil(limit / 2)

  const [cartoResult, apiResponse] = await Promise.all([
    searchStructureCartographieNationale(query, {
      limit: perSourceLimit,
      except: options?.except,
    }),
    rechercheApiEntreprise({
      q: query,
      minimal: true,
      include: 'complements,matching_etablissements',
    })
      .then((data) => ({ data, unavailable: false }) as const)
      .catch(() => ({ data: null, unavailable: true }) as const),
  ])

  const cartoStructures: LieuActiviteSearchResult[] =
    cartoResult.structures.map((s) => ({
      id: s.id,
      nom: s.nom,
      adresse: s.adresse,
      commune: s.commune,
      codePostal: s.codePostal,
      codeInsee: s.codeInsee,
      complementAdresse: s.complementAdresse,
      pivot: s.pivot,
      typologie: s.typologie,
      latitude: s.latitude,
      longitude: s.longitude,
      structures: s.structures,
      source: 'cartographie_nationale' as const,
    }))

  const siretsSeen = new Set<string>(
    cartoStructures.map((s) => s.pivot).filter(Boolean) as string[],
  )

  const localResult = await searchLocalStructures(query, {
    limit: perSourceLimit,
    exceptSirets: siretsSeen,
  })

  for (const s of localResult.structures) {
    if (s.pivot) siretsSeen.add(s.pivot)
  }

  const { data: apiResult, unavailable: apiUnavailable } = apiResponse
  const apiStructures: LieuActiviteSearchResult[] = apiResult
    ? apiResult.results
        .flatMap(structureCreationDataWithSiretFromUniteLegale)
        .filter((s) => s.siret && !siretsSeen.has(s.siret))
        .map((s) => ({
          id: `api_${s.siret}`,
          nom: s.nom,
          adresse: s.adresse ?? '',
          commune: s.commune ?? '',
          codePostal: '',
          codeInsee: s.codeInsee ?? null,
          complementAdresse: null,
          pivot: s.siret,
          typologie:
            (s as unknown as { typologie: string | null }).typologie ?? null,
          latitude: null,
          longitude: null,
          structures: [],
          source: 'api' as const,
        }))
    : []

  const combinedStructures: LieuActiviteSearchResult[] = [
    ...cartoStructures,
    ...localResult.structures,
    ...apiStructures,
  ].slice(0, limit)

  const totalFromApi = apiResult?.total_results ?? 0
  const totalCount =
    cartoResult.matchesCount + localResult.matchesCount + totalFromApi

  const moreResults = Math.max(0, totalCount - combinedStructures.length)

  return {
    structures: combinedStructures,
    matchesCount: totalCount,
    moreResults,
    apiUnavailable,
  }
}

export type SearchLieuActiviteCombinedResult = Awaited<
  ReturnType<typeof searchLieuActiviteCombined>
>
