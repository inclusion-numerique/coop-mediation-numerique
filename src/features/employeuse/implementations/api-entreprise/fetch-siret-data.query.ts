import { rechercheApiEntreprise } from '@/configuration/recherche-entreprises'
import { SiretApiResponse } from '@/features/employeuse/implementations/api-entreprise/siret.payload'
import type {
  MatchingEtablissement,
  UniteLegale,
} from '@/libraries/recherche-entreprises'
import { messageDe } from '@/libraries/result'

const natureJuridiqueEntrepreneurIndividuel = '1000'

const extractVoie = ({
  adresse,
  codePostal,
  libelleCommune,
}: {
  adresse: string
  codePostal: string
  libelleCommune: string
}): string => {
  const suffix = `${codePostal} ${libelleCommune}`.trim().toLowerCase()
  return adresse.toLowerCase().endsWith(suffix)
    ? adresse.slice(0, adresse.length - suffix.length).trim()
    : adresse
}

const toSiretApiResponse = ({
  siret,
  uniteLegale,
  etablissement,
}: {
  siret: string
  uniteLegale: UniteLegale
  etablissement: MatchingEtablissement
}): SiretApiResponse => {
  const estPersonneMorale =
    uniteLegale.nature_juridique !== natureJuridiqueEntrepreneurIndividuel
  const codePostal = etablissement.code_postal ?? ''
  const libelleCommune = etablissement.libelle_commune ?? ''

  return {
    data: {
      siret,
      siege_social: etablissement.est_siege,
      etat_administratif: etablissement.etat_administratif === 'F' ? 'F' : 'A',
      activite_principale: {
        code: etablissement.activite_principale,
        nomenclature: 'NAFRev2',
      },
      unite_legale: {
        siren: uniteLegale.siren,
        type: estPersonneMorale ? 'personne_morale' : 'personne_physique',
        nom_complet: uniteLegale.nom_complet,
        ...(estPersonneMorale
          ? {
              personne_morale_attributs:
                uniteLegale.nom_raison_sociale == null
                  ? {}
                  : { raison_sociale: uniteLegale.nom_raison_sociale },
            }
          : {}),
        forme_juridique: { code: uniteLegale.nature_juridique },
      },
      adresse: {
        numero_voie: null,
        indice_repetition_voie: null,
        type_voie: null,
        libelle_voie: extractVoie({
          adresse: etablissement.adresse,
          codePostal,
          libelleCommune,
        }),
        complement_adresse: null,
        code_commune: etablissement.commune,
        code_postal: codePostal,
        libelle_commune: libelleCommune,
      },
    },
  }
}

export const fetchSiretApiData = async (
  siret: string,
): Promise<
  SiretApiResponse | { error: { statusCode: number; message: string } }
> => {
  try {
    const { results } = await rechercheApiEntreprise(
      {
        q: siret,
        page: 1,
        per_page: 1,
      },
      { retries: 2, factor: 2, minTimeout: 500, maxTimeout: 2_000 },
    )

    const uniteLegale = results.at(0)
    const etablissement = uniteLegale?.matching_etablissements.find(
      (matchingEtablissement) => matchingEtablissement.siret === siret,
    )

    if (!uniteLegale || !etablissement) {
      return {
        error: {
          statusCode: 404,
          message: `SIRET ${siret} introuvable dans l’API Recherche d’entreprises`,
        },
      }
    }

    return toSiretApiResponse({ siret, uniteLegale, etablissement })
  } catch (error) {
    return {
      error: {
        statusCode: 500,
        message: messageDe(error),
      },
    }
  }
}
