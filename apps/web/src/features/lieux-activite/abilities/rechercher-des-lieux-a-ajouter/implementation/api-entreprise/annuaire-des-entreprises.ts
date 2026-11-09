import { structureCreationDataWithSiretFromUniteLegale } from '@app/web/external-apis/api-entreprise/structuresDepuisUniteLegale'
import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
import type { SuggestionDeLieu } from '../../../../domain/suggestion-de-lieu'
import type { ChercherDansLAnnuaireDesEntreprises } from '../../domain/ports'

export const chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises =
  async (recherche) => {
    const resultat = await rechercheApiEntreprise({
      q: recherche,
      minimal: true,
      include: 'complements,matching_etablissements',
    })

    const suggestions: SuggestionDeLieu[] = resultat.results
      .flatMap(structureCreationDataWithSiretFromUniteLegale)
      .filter((structure) => structure.siret)
      .map((structure) => ({
        id: `api_${structure.siret}`,
        nom: structure.nom,
        adresse: structure.adresse ?? '',
        commune: structure.commune ?? '',
        codePostal: '',
        codeInsee: structure.codeInsee ?? null,
        complementAdresse: null,
        pivot: structure.siret,
        typologie: structure.typologie ?? null,
        latitude: null,
        longitude: null,
        structures: [],
        source: 'api',
      }))

    return { suggestions, nombre: resultat.total_results }
  }
