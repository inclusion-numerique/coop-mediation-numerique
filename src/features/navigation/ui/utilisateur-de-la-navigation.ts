type CoordinationDuMediateur = {
  readonly coordinateur: {
    readonly id: string
    readonly user: { readonly name: string | null }
    readonly mediateursCoordonnes: readonly { readonly mediateurId: string }[]
  }
}

export type UtilisateurDeLaNavigation = {
  readonly role: 'User' | 'Support' | 'Admin'
  readonly inscriptionValidee: string | null
  readonly name: string | null
  readonly email: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly usurper: { readonly id: string } | null
  readonly emplois: readonly {
    readonly structure: { readonly nom: string | null }
  }[]
  readonly coordinateur: { readonly id: string } | null
  readonly mediateur: {
    readonly id: string
    readonly _count: { readonly enActivite: number }
    readonly coordinations: readonly CoordinationDuMediateur[]
  } | null
}
