import type { SiretApiResponse } from './siret-api-response'

// Débit API Entreprise : 250 req/min ≈ 4 req/s → 250 ms minimum entre deux appels.
export const API_ENTREPRISE_THROTTLE_MS = 250

export const throttleApiEntreprise = () =>
  new Promise((resolve) => setTimeout(resolve, API_ENTREPRISE_THROTTLE_MS))

export const buildAddressFromApiData = (
  adresse: SiretApiResponse['data']['adresse'],
): string =>
  [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
    adresse.complement_adresse,
  ]
    .filter((part) => Boolean(part) && part !== 'null')
    .join(' ')

export type SireneIdentity = {
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string
  etatAdministratif: string
}

/**
 * Destinée à la COMPLÉTION des structures : accepte TOUT ce
 * que l'API renvoie pour un SIRET (donnée de confiance), y compris les personnes physiques
 * (entrepreneurs individuels, nom via `nom_complet` — masqué en `[Non-Diffusible]`) et les
 * établissements fermés (leur nom/adresse historique vaut mieux qu'un affichage vide). Elle ne peut
 * donc pas échouer ; `etatAdministratif` est conservé pour information.
 */
export const parseSireneIdentityForCompletion = (
  siretResult: SiretApiResponse,
): SireneIdentity => {
  const {
    data: {
      unite_legale: { nom_complet },
      etat_administratif,
      adresse,
    },
  } = siretResult

  return {
    nom: nom_complet,
    adresse: buildAddressFromApiData(adresse),
    commune: adresse.libelle_commune || '',
    codePostal: adresse.code_postal,
    codeInsee: adresse.code_commune || '',
    etatAdministratif: etat_administratif,
  }
}
