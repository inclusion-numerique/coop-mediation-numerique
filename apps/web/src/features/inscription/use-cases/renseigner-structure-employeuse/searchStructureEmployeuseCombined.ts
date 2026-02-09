import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
import { searchStructure } from '@app/web/structure/searchStructure'
import { structureCreationDataWithSiretFromUniteLegale } from '@app/web/structure/structuresInfoFromUniteLegale'

export type StructureSearchResult = {
  id?: string | null
  nom: string
  adresse: string
  codePostal: string
  commune: string
  codeInsee: string
  siret: string
  typologies?: string[] | null
  source: 'database' | 'api'
}

export const searchStructureEmployeuseCombined = async (
  query: string,
): Promise<{
  structures: StructureSearchResult[]
  totalCount: number
  moreResults: number
  apiUnavailable: boolean
}> => {
  if (query.length < 3) {
    return {
      structures: [],
      totalCount: 0,
      moreResults: 0,
      apiUnavailable: false,
    }
  }

  const [dbResult, apiResponse] = await Promise.all([
    searchStructure(query, { limit: 25 }),
    rechercheApiEntreprise({
      q: query,
      minimal: true,
      include: 'complements,matching_etablissements',
    })
      .then((data) => ({ data, unavailable: false }) as const)
      .catch(() => ({ data: null, unavailable: true }) as const),
  ])

  const { data: apiResult, unavailable: apiUnavailable } = apiResponse

  const dbStructures: StructureSearchResult[] = dbResult.structures
    .filter((structure) => structure.siret)
    .map((structure) => ({
      id: structure.id,
      nom: structure.nom,
      adresse: structure.adresse ?? '',
      commune: structure.commune ?? '',
      codePostal: structure.codePostal ?? '',
      codeInsee: structure.codeInsee ?? '',
      siret: structure.siret as string,
      typologies: structure.typologies,
      source: 'database' as const,
    }))

  const apiStructures: StructureSearchResult[] = apiResult
    ? apiResult.results
        .flatMap(structureCreationDataWithSiretFromUniteLegale)
        .filter((structure) => structure.siret)
        .map((structure) => ({
          nom: structure.nom,
          adresse: structure.adresse ?? '',
          commune: structure.commune ?? '',
          codePostal: structure.codePostal ?? '',
          codeInsee: structure.codeInsee ?? '',
          siret: structure.siret as string,
          typologies: structure.typologies ?? null,
          source: 'api' as const,
        }))
    : []

  const siretsSeen = new Set<string>(dbStructures.map((s) => s.siret))
  const deduplicatedStructures: StructureSearchResult[] = [
    ...dbStructures,
    ...apiStructures.filter((s) => !siretsSeen.has(s.siret)),
  ]

  const totalFromApi = apiResult?.total_results ?? 0
  const moreResults =
    dbResult.moreResults + Math.max(0, totalFromApi - apiStructures.length)

  return {
    structures: deduplicatedStructures.slice(0, 50),
    totalCount: deduplicatedStructures.length,
    moreResults,
    apiUnavailable,
  }
}
