import { structureCreationDataWithSiretFromUniteLegale } from '@app/web/external-apis/api-entreprise/structuresDepuisUniteLegale'
import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
// Modules visés directement plutôt que le barrel `../../../server` : celui-ci réexporte cette
// implémentation, et l'atteindre depuis ici fermerait un cycle d'imports.
import { rechercherEmployeuse } from '../../rechercher-employeuse/implementation'
import { employeuseRecherchee } from '../../rechercher-employeuse/ui/employeuse-recherchee.presenter'
import type { StructureSearchResult } from '../domain/employeuse-choisie'

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

  // Le SIRET identifie le choix : une employeuse enregistrée qui n'en a pas ne
  // peut pas être proposée.
  const dbStructures: StructureSearchResult[] = dbResult.employeuses
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
      // L'employeuse enregistrée n'en porte pas : `main.structure_administrative`
      // ne range aucune typologie. Seul l'annuaire sait la déduire.
      typologie: null,
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
  const deduplicatedStructures: StructureSearchResult[] = [
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
