export type LigneDeLaListe = {
  readonly id: string
  readonly nom: string
  readonly adresse: string | null
  readonly commune: string | null
  readonly codePostal: string | null
  readonly siret: string | null
  readonly typologies: readonly string[]
  readonly visiblePourCartographieNationale: boolean
  readonly structureCartographieNationaleId: string | null
  readonly adresseAPreciser: boolean
  readonly creation: Date
  readonly modification: Date
  readonly _count: {
    readonly mediateursEnActivite: number
    readonly activites: number
  }
}

export type PageDeLieux = {
  readonly structures: readonly LigneDeLaListe[]
  readonly totalPages: number
  readonly matchesCount: number
}
