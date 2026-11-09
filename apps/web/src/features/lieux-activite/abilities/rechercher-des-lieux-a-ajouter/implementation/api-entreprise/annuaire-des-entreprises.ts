import { structureCreationDataWithSiretFromUniteLegale } from '@app/web/external-apis/api-entreprise/structuresDepuisUniteLegale'
import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
import {
  Nom,
  Siret,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { NombreDeLieux } from '../../../../domain/nombres'
import { reconnues } from '../../../../domain/nomenclatures'
import {
  AdresseLibre,
  type SuggestionDeLieu,
} from '../../../../domain/suggestion-de-lieu'
import type { ChercherDansLAnnuaireDesEntreprises } from '../../domain/ports'

type Etablissement = ReturnType<
  typeof structureCreationDataWithSiretFromUniteLegale
>[number]

const suggestion = (etablissement: Etablissement): SuggestionDeLieu[] => {
  const siret = Siret.safe(etablissement.siret ?? '')
  const nom = Nom.safe(etablissement.nom)
  const adresse = AdresseLibre.safe({
    voie: etablissement.adresse ?? '',
    commune: etablissement.commune ?? '',
    codePostal: '',
    codeInsee: etablissement.codeInsee ?? null,
    complement: null,
  })

  return siret == null || nom == null || adresse == null
    ? []
    : [
        {
          provenance: { _tag: 'Annuaire', siret },
          nom,
          adresse,
          siret,
          typologies: reconnues(
            Typologie,
            etablissement.typologie == null ? [] : [etablissement.typologie],
          ),
        },
      ]
}

export const chercherDansLAnnuaireDesEntreprises: ChercherDansLAnnuaireDesEntreprises =
  async (recherche) => {
    const resultat = await rechercheApiEntreprise({
      q: recherche,
      minimal: true,
      include: 'complements,matching_etablissements',
    })

    return {
      suggestions: resultat.results
        .flatMap(structureCreationDataWithSiretFromUniteLegale)
        .flatMap(suggestion),
      nombre: NombreDeLieux(resultat.total_results),
    }
  }
