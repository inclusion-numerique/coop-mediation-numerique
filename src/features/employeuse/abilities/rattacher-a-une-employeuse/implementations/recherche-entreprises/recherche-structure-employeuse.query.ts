import { rechercheApiEntreprise } from '@/configuration/recherche-entreprises'
import { etablissementsDepuisUniteLegale } from '@/libraries/recherche-entreprises'
import type { Employeuse } from '../../../../domain/employeuse'
import type { RechercherEmployeuse } from '../../../../domain/ports'
import type { TypologieStructure } from '../../../../domain/typologie-de-structure'

type StructureTrouvee = {
  readonly id?: string | null
  readonly nom: string
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string
  readonly siret: string
  readonly typologie?: TypologieStructure | null
  readonly source: 'database' | 'api'
}

const premiereParSiret = (
  structure: StructureTrouvee,
  index: number,
  structures: readonly StructureTrouvee[],
): boolean =>
  structures.findIndex(({ siret }) => siret === structure.siret) === index

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
    structures: readonly StructureTrouvee[]
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

    const dbStructures: readonly StructureTrouvee[] = dbResult.employeuses
      .map(employeuseRecherchee)
      .flatMap(({ siret, ...structure }) =>
        siret
          ? [
              {
                id: structure.id,
                nom: structure.nom,
                adresse: structure.adresse,
                commune: structure.commune,
                codePostal: structure.codePostal,
                codeInsee: structure.codeInsee ?? '',
                siret,
                typologie: null,
                source: 'database' as const,
              },
            ]
          : [],
      )

    const apiStructures: readonly StructureTrouvee[] = apiResult
      ? apiResult.results
          .flatMap(etablissementsDepuisUniteLegale)
          .flatMap((structure) =>
            structure.siret
              ? [
                  {
                    nom: structure.nom,
                    adresse: structure.adresse ?? '',
                    commune: structure.commune ?? '',
                    codePostal: structure.codePostal ?? '',
                    codeInsee: structure.codeInsee ?? '',
                    siret: structure.siret,
                    typologie: structure.typologie,
                    source: 'api' as const,
                  },
                ]
              : [],
          )
      : []

    const uniqueDbStructures = dbStructures.filter(premiereParSiret)
    const siretsDeLaCoop = uniqueDbStructures.map(({ siret }) => siret)
    const deduplicatedStructures: readonly StructureTrouvee[] = [
      ...uniqueDbStructures,
      ...apiStructures.filter(({ siret }) => !siretsDeLaCoop.includes(siret)),
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
