export type SaisieEmployeuse = {
  readonly siret: string
  readonly denomination: string | null
  readonly adresse: {
    readonly voie: string
    readonly commune: string
    readonly codePostal: string | null
    readonly codeInsee: string | null
  }
}
