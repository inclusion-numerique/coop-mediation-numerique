/**
 * Ce que l'annuaire a besoin de savoir d'un lieu pour l'afficher.
 *
 * Le contrat est déclaré ici, chez celui qui affiche, et non emprunté à la
 * feature qui interroge la base : `mon-reseau` dit de quoi ses cartes ont
 * besoin, `lieux-activite` sait le produire, et c'est la route qui les met en
 * présence. Aucune des deux features n'importe l'autre ; c'est la compatibilité
 * structurelle des deux formes qui les tient, et le typage la vérifie à
 * l'endroit où elles se rencontrent.
 */
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
  readonly _count: { readonly mediateursEnActivite: number }
}

/** Une page de résultats de l'annuaire. */
export type LieuxTrouves = {
  readonly lieux: readonly LieuAffiche[]
  readonly totalCount: number
  readonly totalPages: number
  readonly page: number
  readonly pageSize: number
}
