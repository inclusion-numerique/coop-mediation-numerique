import { type NomAffiche, nomAffiche } from '@app/web/libraries/nom-affiche'

export type LieuAffiche = {
  readonly id: string
  readonly nom: string
  readonly nomUsage: string | null
  readonly adresse: string
  readonly complementAdresse: string | null
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly modification: Date
  readonly derniereModificationPar: {
    readonly id: string
    readonly firstName: string | null
    readonly lastName: string | null
    readonly name: string | null
    readonly email: string
  } | null
  readonly derniereModificationSource: string | null
  readonly visiblePourCartographieNationale: boolean
  readonly structureCartographieNationaleId: string | null
  readonly adresseAPreciser: boolean
  readonly _count: { readonly mediateursEnActivite: number }
}

export type LieuxTrouves = {
  readonly lieux: readonly LieuAffiche[]
  readonly totalCount: number
  readonly totalPages: number
  readonly page: number
  readonly pageSize: number
}

export const auteurDeLaDerniereModification = ({
  derniereModificationPar,
}: Pick<LieuAffiche, 'derniereModificationPar'>): NomAffiche | null =>
  derniereModificationPar === null
    ? null
    : nomAffiche({
        prenom: derniereModificationPar.firstName,
        nom: derniereModificationPar.lastName,
        nomComplet: derniereModificationPar.name,
        courriel: derniereModificationPar.email,
      })
