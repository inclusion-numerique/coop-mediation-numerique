export type LieuAReprendre = {
  readonly id: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
  readonly horaires: string | null
  readonly adresse: string
  readonly codeInsee: string | null
  readonly banId: string | null
  readonly latitude: number | null
  readonly longitude: number | null
  readonly rna: string | null
  readonly presentationResume: string | null
  readonly presentationDetail: string | null
  readonly telephone: string | null
  readonly courriels: readonly string[]
  readonly siteWeb: readonly string[]
  readonly typologies: readonly string[]
  readonly services: readonly string[]
  readonly modalitesAcces: readonly string[]
  readonly modalitesAccompagnement: readonly string[]
  readonly publicsSpecifiquementAdresses: readonly string[]
  readonly priseEnChargeSpecifique: readonly string[]
  readonly fraisACharge: readonly string[]
  readonly itinerance: readonly string[]
  readonly dispositifProgrammesNationaux: readonly string[]
  readonly formationsLabels: readonly string[]
  readonly autresFormationsLabels: readonly string[]
}

export const nonVide = (valeur: string | null | undefined): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur.trim() : null
