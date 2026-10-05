/**
 * Documentation: https://adresse.data.gouv.fr/api-doc/adresse
 */
export const apiAdresseEndpoint = 'https://data.geopf.fr/geocodage/search'

export type FeatureCollection = {
  type: 'FeatureCollection' // Type de la collection de fonctionnalités
  version: string // Version de la collection de fonctionnalités
  features: Array<Feature> // Liste des fonctionnalités
  attribution: string // Attribution de la source des données
  licence: string // Licence des données
  query: string // Requête initiale
  limit: number // Limite des résultats
}

export type Feature = {
  type: 'Feature' // Type de la fonctionnalité
  geometry: Geometry // Géométrie de la fonctionnalité
  properties: Properties // Propriétés de la fonctionnalité
}

export type Geometry = {
  type: 'Point' // Type de la géométrie
  coordinates: [number, number] // Coordonnées géographiques (longitude, latitude)
}

/**
 * housenumber : numéro « à la plaque »
 * street : position « à la voie », placé approximativement au centre de celle-ci
 * locality : lieu-dit
 * municipality : numéro « à la commune »
 */
export type AdresseType = 'housenumber' | 'street' | 'locality' | 'municipality'

export type Properties = {
  label: string // Adresse complète
  score: number // Score de correspondance
  housenumber: string // Numéro de la maison
  id: string // Identifiant BAN de l'adresse (clé "codeInsee_voie_numero", PAS un uuid)
  banId?: string // Identifiant BAN pérenne au format uuid (destiné à main.adresse.code_ban)
  type: AdresseType // Type de la fonctionnalité (e.g., "housenumber")
  name: string // Nom de la rue avec le numéro de la maison
  postcode: string // Code postal
  citycode: string // Code INSEE de la ville
  x: number // Coordonnée X (projection)
  y: number // Coordonnée Y (projection)
  city: string // Nom de la ville
  context: string // Contexte géographique (e.g., département, région)
  importance: number // Importance de la correspondance
  street: string // Nom de la rue
}

export type SearchAdresseOptions = {
  limit?: number
  autocomplete?: boolean
  type?: AdresseType
  citycode?: string
}

export const SERVICE_ADRESSE_INDISPONIBLE =
  'Le service d’adresse est momentanément indisponible, réessayez dans quelques instants.'

export class AdresseIndisponible extends Error {
  constructor(cause: string) {
    super(`Service d’adresse indisponible : ${cause}`)
    this.name = 'AdresseIndisponible'
  }
}

export const siIndisponible =
  <T>(repli: T, signaler?: (erreur: AdresseIndisponible) => void) =>
  (erreur: unknown): T => {
    if (!(erreur instanceof AdresseIndisponible)) throw erreur
    signaler?.(erreur)
    return repli
  }

const LONGUEUR_MINIMALE = 3

const LONGUEUR_MAXIMALE = 200

const COMMENCE_PAR_UNE_LETTRE_OU_UN_CHIFFRE = /^[\p{L}\p{N}]/u

export const requeteGeocodable = (requete: string): boolean =>
  requete.length >= LONGUEUR_MINIMALE &&
  requete.length <= LONGUEUR_MAXIMALE &&
  COMMENCE_PAR_UNE_LETTRE_OU_UN_CHIFFRE.test(requete)

export const urlDeRecherche = (
  requete: string,
  options?: SearchAdresseOptions,
): URL => {
  const url = new URL(apiAdresseEndpoint)

  url.searchParams.append('q', requete)
  url.searchParams.append('limit', (options?.limit ?? 1).toString(10))
  url.searchParams.append('autocomplete', options?.autocomplete ? '1' : '0')
  if (options?.type) url.searchParams.append('type', options.type)
  if (options?.citycode) url.searchParams.append('citycode', options.citycode)

  return url
}

export const lireLaReponse = async (response: Response): Promise<Feature[]> => {
  if (!response.ok) throw new AdresseIndisponible(`HTTP ${response.status}`)

  const body = (await response.json()) as FeatureCollection

  return body.features ?? []
}

export const searchAdresses = async (
  adresse: string,
  options?: SearchAdresseOptions,
): Promise<Feature[]> => {
  const requete = adresse.trim()

  if (!requeteGeocodable(requete)) return []

  const response = await fetch(urlDeRecherche(requete, options)).catch(
    (erreur: unknown) =>
      Promise.reject(new AdresseIndisponible(String(erreur))),
  )

  return lireLaReponse(response)
}

export const searchAdresse = (adresse: string): Promise<Feature | null> =>
  searchAdresses(adresse, {
    autocomplete: false,
    limit: 1,
  }).then((features) => features[0] ?? null)
