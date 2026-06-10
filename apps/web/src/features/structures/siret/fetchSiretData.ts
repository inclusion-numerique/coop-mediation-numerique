import type {
  MatchingEtablissement,
  UniteLegale,
} from '@app/web/external-apis/apiEntrepriseApiModels'
import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
import { SiretApiResponse } from './SiretApiResponse'

// Catégorie juridique INSEE des entrepreneurs individuels (personnes physiques)
const natureJuridiqueEntrepreneurIndividuel = '1000'

/**
 * The etablissement address from the public Recherche d'entreprises API is a
 * single string "VOIE CODE_POSTAL COMMUNE" : the code postal + commune suffix
 * is stripped to recover the voie alone.
 */
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
        personne_morale_attributs: estPersonneMorale
          ? { raison_sociale: uniteLegale.nom_raison_sociale ?? undefined }
          : undefined,
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

/**
 * Fetch etablissement data for a SIRET from the public Recherche
 * d'entreprises API (no token required). Non-diffusible structures come back
 * with a masked raison sociale ("[NON-DIFFUSIBLE]"), like every open data
 * source.
 */
export const fetchSiretApiData = async (
  siret: string,
): Promise<
  SiretApiResponse | { error: { statusCode: number; message: string } }
> => {
  try {
    const { results } = await rechercheApiEntreprise({
      q: siret,
      page: 1,
      per_page: 1,
    })

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
        message: (error as Error).message,
      },
    }
  }
}

export type SiretErrorType = 'invalidSiret' | 'apiError'

export const fetchSiretData = async (siret: string) => {
  const siretResult = await fetchSiretApiData(siret)

  if ('error' in siretResult) {
    return {
      error: {
        type:
          'statusCode' in siretResult.error &&
          siretResult.error.statusCode.toString().startsWith('4')
            ? ('invalidSiret' as SiretErrorType)
            : ('apiError' as SiretErrorType),
        message: siretResult.error.message,
      },
      siretInfo: null,
    }
  }

  const {
    data: {
      unite_legale: { personne_morale_attributs, forme_juridique, siren },
      etat_administratif,
      activite_principale,
    },
  } = siretResult

  if (!personne_morale_attributs?.raison_sociale) {
    return {
      error: {
        type: 'invalidSiret' as SiretErrorType,
        message: 'Ce siret ne correspond pas à une personne morale',
      },
      siretInfo: null,
    }
  }

  if (etat_administratif === 'F') {
    return {
      error: {
        type: 'invalidSiret' as SiretErrorType,
        message: 'Cet établissement est fermé',
      },
      siretInfo: null,
    }
  }

  return {
    error: null,
    siretInfo: {
      siret,
      siren,
      activitePrincipale: activite_principale,
      nom: personne_morale_attributs.raison_sociale,
      formeJuridique: forme_juridique,
    },
  }
}
