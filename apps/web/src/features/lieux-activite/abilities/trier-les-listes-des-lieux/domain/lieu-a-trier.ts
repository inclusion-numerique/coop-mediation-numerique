export type LieuATrier = {
  readonly id: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
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
] as const satisfies readonly (keyof LieuATrier)[]

export type ColonneDeListe = (typeof LISTES)[number]
