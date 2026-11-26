import { rechercheApiEntreprise } from '@/configuration/recherche-entreprises'
import { etablissementsDepuisUniteLegale } from '@/libraries/recherche-entreprises'
import type { Employeuse } from '../../../../domain/employeuse'
import type { RechercherEmployeuse } from '../../../../domain/ports'
import type { StructureTrouvee } from '../../domain/structure-trouvee'

type EmployeuseRecherchee = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly siret: string | null
}

export const rechercheStructureEmployeuseAvec =
  ({
    employeuseRecherchee,
    rechercherEmployeuse,
  }: {
    readonly employeuseRecherchee: (
      employeuse: Employeuse,
    ) => EmployeuseRecherchee
    readonly rechercherEmployeuse: RechercherEmployeuse
  }) =>
  async (
    query: string,
  ): Promise<{
    structures: StructureTrouvee[]
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
      rechercherEmployeuse({ recherche: query, limite: 25 }),
      rechercheApiEntreprise({
        q: query,
        minimal: true,
        include: 'complements,matching_etablissements',
      })
        .then((data) => ({ data, unavailable: false }) as const)
        .catch(() => ({ data: null, unavailable: true }) as const),
    ])

    const { data: apiResult, unavailable: apiUnavailable } = apiResponse

    const dbStructures: StructureTrouvee[] = dbResult.employeuses
      .map(employeuseRecherchee)
      .filter((structure) => structure.siret)
      .map((structure) => ({
        id: structure.id,
        nom: structure.nom,
        adresse: structure.adresse,
        commune: structure.commune,
        codePostal: structure.codePostal,
        codeInsee: structure.codeInsee ?? '',
        siret: structure.siret as string,
        typologie: null,
        source: 'database' as const,
      }))

    const apiStructures: StructureTrouvee[] = apiResult
      ? apiResult.results
          .flatMap(etablissementsDepuisUniteLegale)
          .filter((structure) => structure.siret)
          .map((structure) => ({
            nom: structure.nom,
            adresse: structure.adresse ?? '',
            commune: structure.commune ?? '',
            codePostal: structure.codePostal ?? '',
            codeInsee: structure.codeInsee ?? '',
            siret: structure.siret as string,
            typologie: structure.typologie,
            source: 'api' as const,
          }))
      : []

    const siretsSeen = new Set<string>()
    const uniqueDbStructures = dbStructures.filter((s) => {
      if (siretsSeen.has(s.siret)) return false
      siretsSeen.add(s.siret)
      return true
    })
    const deduplicatedStructures: StructureTrouvee[] = [
      ...uniqueDbStructures,
      ...apiStructures.filter((s) => !siretsSeen.has(s.siret)),
    ]

    const totalFromApi = apiResult?.total_results ?? 0
    const moreResults =
      Math.max(dbResult.total - dbStructures.length, 0) +
      Math.max(0, totalFromApi - apiStructures.length)

    return {
      structures: deduplicatedStructures.slice(0, 50),
      totalCount: deduplicatedStructures.length,
      moreResults,
      apiUnavailable,
    }
  }
