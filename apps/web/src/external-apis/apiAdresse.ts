/**
 * Documentation: https://adresse.data.gouv.fr/api-doc/adresse
 */
export const apiAdresseEndpoint = 'https://api-adresse.data.gouv.fr/search'

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
  id: string // Identifiant unique
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
}

export const searchAdresses = async (
  adresse: string,
  options?: SearchAdresseOptions,
): Promise<Feature[]> => {
  if (adresse.length < 3) return []

  const url = new URL(apiAdresseEndpoint)

  const limit = options?.limit ?? 1
  const autocomplete = options?.autocomplete ?? false

  url.searchParams.append('q', adresse)
  url.searchParams.append('limit', limit.toString(10))
  url.searchParams.append('autocomplete', autocomplete ? '1' : '0')
  if (options?.type) url.searchParams.append('type', options.type)

  const response = await fetch(url.toString())
  const body = (await response.json()) as FeatureCollection

  return body.features || []
}

export const searchAdresse = (adresse: string): Promise<Feature | null> =>
  searchAdresses(adresse, {
    autocomplete: false,
    limit: 1,
  }).then((features) => features[0] ?? null)
