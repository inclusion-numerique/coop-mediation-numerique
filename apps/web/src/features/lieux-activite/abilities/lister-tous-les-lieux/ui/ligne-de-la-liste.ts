/**
 * Ce que la liste d'administration montre d'un lieu.
 *
 * L'écran écrit ce dont il a besoin, et la requête s'y conforme : la
 * dépendance va de la base vers l'affichage, jamais l'inverse. Auparavant ce
 * type se déduisait du `select` Prisma, ce qui revenait à laisser la base
 * décider de ce que la page pouvait montrer — et à faire entrer Prisma dans
 * l'écran par le type de sa ligne.
 *
 * Les compteurs gardent la forme que Prisma leur donne (`_count`) : c'est la
 * seule concession, et elle n'engage aucun type du client.
 */
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
  readonly creation: Date
  readonly modification: Date
  readonly emploisCount: number
  readonly _count: {
    readonly mediateursEnActivite: number
    readonly activites: number
  }
}

/**
 * Ce que le tableau reçoit : les lignes de la page, et de combien de pages
 * elle fait partie. Le reste de ce que la recherche rapporte — les décomptes —
 * s'affiche ailleurs.
 */
export type PageDeLieux = {
  readonly structures: readonly LigneDeLaListe[]
  readonly totalPages: number
}
