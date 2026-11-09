export type AuteurDeModification = {
  readonly id: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly name: string | null
  readonly email: string
}

export type LieuEnListe = {
  readonly id: string
  readonly nom: string
  readonly nomUsage: string | null
  readonly adresse: string
  readonly complementAdresse: string | null
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly modification: Date
  readonly derniereModificationPar: AuteurDeModification | null
  readonly derniereModificationSource: string | null
  readonly visiblePourCartographieNationale: boolean
  readonly _count: { readonly mediateursEnActivite: number }
  readonly adresseAPreciser: boolean
  readonly structureCartographieNationaleId: string | null
}
