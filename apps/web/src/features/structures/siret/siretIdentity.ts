import type { SiretApiResponse } from '@app/web/features/structures/siret/SiretApiResponse'

// Débit API Entreprise : 250 req/min ≈ 4 req/s → 250 ms minimum entre deux appels.
export const API_ENTREPRISE_THROTTLE_MS = 250

export const throttleApiEntreprise = () =>
  new Promise((resolve) => setTimeout(resolve, API_ENTREPRISE_THROTTLE_MS))

// Seuils de similarité (Dice) pour juger qu'un nom / une adresse « correspond ».
export const NOM_SIMILARITY_THRESHOLD = 0.8
export const ADRESSE_SIMILARITY_THRESHOLD = 0.7

const normalizeForComparison = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const bigrams = (value: string): Map<string, number> =>
  Array.from({ length: Math.max(value.length - 1, 0) }).reduce<
    Map<string, number>
  >((accumulator, _, index) => {
    const bigram = value.slice(index, index + 2)
    accumulator.set(bigram, (accumulator.get(bigram) ?? 0) + 1)
    return accumulator
  }, new Map())

/** Similarité de Dice (bigrammes) entre deux chaînes normalisées, dans [0, 1]. */
export const diceSimilarity = (a: string, b: string): number => {
  const na = normalizeForComparison(a)
  const nb = normalizeForComparison(b)

  if (na === nb) return 1
  if (na.length < 2 || nb.length < 2) return 0

  const bigramsA = bigrams(na)
  const bigramsB = bigrams(nb)

  const intersection = Array.from(bigramsA).reduce(
    (total, [bigram, countA]) =>
      total + Math.min(countA, bigramsB.get(bigram) ?? 0),
    0,
  )

  return (2 * intersection) / (na.length - 1 + (nb.length - 1))
}

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

export type SireneParseFailure = 'personne_physique' | 'etablissement_ferme'

/**
 * Extrait l'identité légale (personne morale ouverte) d'une réponse API Entreprise.
 * Renvoie une `SireneParseFailure` si l'établissement est fermé ou est une personne physique.
 */
export const parseSireneIdentity = (
  siretResult: SiretApiResponse,
): { identity: SireneIdentity } | { failure: SireneParseFailure } => {
  const {
    data: {
      unite_legale: { personne_morale_attributs },
      etat_administratif,
      adresse,
    },
  } = siretResult

  if (!personne_morale_attributs?.raison_sociale) {
    return { failure: 'personne_physique' }
  }

  if (etat_administratif === 'F') {
    return { failure: 'etablissement_ferme' }
  }

  return {
    identity: {
      nom: personne_morale_attributs.raison_sociale,
      adresse: buildAddressFromApiData(adresse),
      commune: adresse.libelle_commune || '',
      codePostal: adresse.code_postal,
      codeInsee: adresse.code_commune || '',
      etatAdministratif: etat_administratif,
    },
  }
}
