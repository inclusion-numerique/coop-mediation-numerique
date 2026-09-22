export type LieuAReprendre = {
  readonly id: string
  readonly nom: string
  readonly siret: string | null
  readonly rna: string | null
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  readonly banId: string | null
  readonly latitude: number | null
  readonly longitude: number | null
  readonly telephone: string | null
  readonly courriels: readonly string[]
  readonly siteWeb: readonly string[]
  readonly horaires: string | null
  readonly presentationResume: string | null
  readonly presentationDetail: string | null
  readonly ficheAccesLibre: string | null
  readonly priseRdv: string | null
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
  readonly publie: boolean
}

export const LISTES = [
  'typologies',
  'services',
  'modalitesAcces',
  'modalitesAccompagnement',
  'publicsSpecifiquementAdresses',
  'priseEnChargeSpecifique',
  'fraisACharge',
  'itinerance',
  'dispositifProgrammesNationaux',
  'formationsLabels',
  'autresFormationsLabels',
] as const satisfies readonly (keyof LieuAReprendre)[]

export type ColonneDeListe = (typeof LISTES)[number]

export const nonVide = (valeur: string | null | undefined): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur.trim() : null

export const renseignee = (valeur: string | null): readonly string[] => {
  const texte = nonVide(valeur)

  return texte == null ? [] : [texte]
}

export const renseignees = (valeurs: readonly string[]): readonly string[] =>
  valeurs.flatMap(renseignee)
