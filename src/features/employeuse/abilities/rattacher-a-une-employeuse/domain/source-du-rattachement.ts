export type SaisieEmployeuse = {
  readonly siret: string
  readonly denomination: string | null
  readonly adresse: {
    readonly voie: string | null
    readonly commune: string
    readonly codePostal: string | null
    readonly codeInsee: string | null
  }
}

export type SourceDuRattachement =
  | { readonly _tag: 'Saisie'; readonly saisie: SaisieEmployeuse }
  | { readonly _tag: 'Siret'; readonly siret: string }
  | { readonly _tag: 'ProConnect'; readonly siret: string | null }
