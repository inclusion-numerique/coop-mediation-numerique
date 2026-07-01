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
  options?: { limit?: number; includeCartoLinked?: boolean },
) => {
  const limit = options?.limit || 25
  const queryParts = query.split(' ')

  const matchesWhere = {
    suppression: null,
    // Par défaut on exclut les structures déjà reliées à la carto : elles sont
    // remontées par la source carto. Pour une recherche SIRET on les inclut.
    ...(options?.includeCartoLinked
      ? {}
      : { structureCartographieNationaleId: null }),
    AND: queryParts.map((part) => ({
      OR: [
        { siret: { contains: part, mode: 'insensitive' } },
        { nom: { contains: part, mode: 'insensitive' } },
        { adresse: { contains: part, mode: 'insensitive' } },
        { commune: { contains: part, mode: 'insensitive' } },
      ],
    })),
  } satisfies Prisma.LieuInclusionWhereInput

  const structuresRaw = await prismaClient.lieuInclusion.findMany({
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

  const matchesCount = await prismaClient.lieuInclusion.count({
    where: matchesWhere,
  })

  const structures: LieuActiviteSearchResult[] = structuresRaw.map(
    (structure) => ({
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
    }),
  )

  return { structures, matchesCount }
}

const searchApiEntreprise = (query: string) =>
  rechercheApiEntreprise({
    q: query,
    minimal: true,
    include: 'complements,matching_etablissements',
  })
    .then((data) => ({ data, unavailable: false }) as const)
    .catch(() => ({ data: null, unavailable: true }) as const)

const toApiStructures = (
  apiResult: Awaited<ReturnType<typeof rechercheApiEntreprise>> | null,
): LieuActiviteSearchResult[] =>
  apiResult
    ? apiResult.results
        .flatMap(structureCreationDataWithSiretFromUniteLegale)
        .filter((s) => s.siret)
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

// Une requête qui ressemble à un SIRET/SIREN (chiffres uniquement) : on cherche dans
// les structures coop, et à défaut dans l'API entreprise (la carto n'est pas une source
// SIRET fiable). La recherche par nom interroge en plus la cartographie nationale.
const isSiretQuery = (query: string): boolean =>
  /^\d{9,14}$/.test(query.replace(/\s/g, ''))

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

  // Repli : l'API entreprise n'est interrogée QUE si les sources prioritaires
  // (coop, et la carto pour la recherche par nom) ne renvoient rien.
  const apiFallback = async () => {
    const { data: apiResult, unavailable: apiUnavailable } =
      await searchApiEntreprise(query)
    const structures = toApiStructures(apiResult).slice(0, limit)
    const totalFromApi = apiResult?.total_results ?? 0

    return {
      structures,
      matchesCount: totalFromApi,
      moreResults: Math.max(0, totalFromApi - structures.length),
      apiUnavailable,
    }
  }

  // Recherche par SIRET → structures coop en priorité, à défaut API entreprise.
  if (isSiretQuery(query)) {
    const localResult = await searchLocalStructures(query, {
      limit,
      includeCartoLinked: true,
    })

    if (localResult.structures.length === 0) {
      return apiFallback()
    }

    const structures = localResult.structures.slice(0, limit)
    return {
      structures,
      matchesCount: localResult.matchesCount,
      moreResults: Math.max(0, localResult.matchesCount - structures.length),
      apiUnavailable: false,
    }
  }

  // Recherche par nom → structures coop puis carto en priorité, à défaut API entreprise.
  const perSourceLimit = Math.ceil(limit / 2)

  const [localResult, cartoResult] = await Promise.all([
    searchLocalStructures(query, { limit: perSourceLimit }),
    searchStructureCartographieNationale(query, {
      limit: perSourceLimit,
      except: options?.except,
    }),
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

  const prioritized: LieuActiviteSearchResult[] = [
    ...localResult.structures,
    ...cartoStructures,
  ]

  if (prioritized.length === 0) {
    return apiFallback()
  }

  const structures = prioritized.slice(0, limit)
  const matchesCount = localResult.matchesCount + cartoResult.matchesCount

  return {
    structures,
    matchesCount,
    moreResults: Math.max(0, matchesCount - structures.length),
    apiUnavailable: false,
  }
}

export type SearchLieuActiviteCombinedResult = Awaited<
  ReturnType<typeof searchLieuActiviteCombined>
>
