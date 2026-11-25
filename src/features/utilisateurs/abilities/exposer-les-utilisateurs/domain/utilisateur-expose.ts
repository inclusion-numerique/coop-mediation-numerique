type Lien = {
  readonly id: string
  readonly creation: Date
  readonly modification: Date
  readonly suppression: Date | null
  readonly mediateur: { readonly userId: string }
}

export type UtilisateurExpose = {
  readonly id: string
  readonly email: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly phone: string | null
  readonly inscriptionValidee: Date | null
  readonly created: Date
  readonly updated: Date
  readonly deleted: Date | null
  readonly personneMain: {
    readonly id: number
    readonly cnPgId: number | null
    readonly conseillerNumeriqueEnPoste: object | null
    readonly affectationsEmploi: readonly {
      readonly id: number
      readonly structureAdministrativeId: number
      readonly createdAt: Date | null
    }[]
    readonly contrats: readonly {
      readonly structureId: number | null
      readonly dateDebut: Date | null
      readonly dateFin: Date | null
      readonly dateRupture: Date | null
    }[]
  } | null
  readonly mediateur: {
    readonly id: string
    readonly creation: Date
    readonly modification: Date
    readonly isVisible: boolean
    readonly enActivite: readonly {
      readonly id: string
      readonly structureId: string
      readonly debut: Date
      readonly fin: Date | null
      readonly creation: Date
      readonly modification: Date
      readonly suppression: Date | null
    }[]
    readonly coordinations: readonly (Lien & {
      readonly coordinateurId: string
    })[]
  } | null
  readonly coordinateur: {
    readonly id: string
    readonly creation: Date
    readonly modification: Date
    readonly mediateursCoordonnes: readonly (Lien & {
      readonly mediateurId: string
    })[]
  } | null
}
