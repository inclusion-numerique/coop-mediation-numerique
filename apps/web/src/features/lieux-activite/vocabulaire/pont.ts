/**
 * Un pont entre le vocabulaire propre à la coop et celui du schéma national. La
 * table est la seule source : elle est complète — chaque nom coop y a son
 * équivalent standard — donc traduire vers le standard ne peut pas échouer.
 * L'inverse, si : une valeur du standard que la coop ne connaît pas n'a pas de
 * nom ici.
 *
 * L'énumération du standard n'est là que pour son type : sans elle, les valeurs
 * citées par la table seraient les seules que `versCoop` accepterait, alors
 * qu'elle doit répondre sur toute l'énumération. `pontParNom` la reçoit déjà.
 */
export const pont = <Standard extends string, Coop extends string>(
  _standard: Record<string, Standard>,
  table: Record<Coop, Standard>,
) => {
  const inverse = new Map<Standard, Coop>(
    Object.entries(table).map(([coop, standard]) => [
      standard as Standard,
      coop as Coop,
    ]),
  )

  return {
    table,
    valeurs: Object.keys(table) as [Coop, ...Coop[]],
    versStandard: (valeur: Coop): Standard => table[valeur],
    versCoop: (valeur: Standard): Coop | null => inverse.get(valeur) ?? null,
  }
}

/**
 * Variante pour la typologie, seule nomenclature dont la table coop ne porte pas
 * les valeurs du standard mais des libellés d'affichage : la correspondance s'y
 * fait par identité des noms, à une exception près.
 */
export const pontParNom = <Coop extends string, Standard extends string>(
  standard: Record<string, Standard>,
  noms: readonly Coop[],
  divergences: readonly (readonly [Coop, Standard])[],
) => {
  const versStandardExceptionnel = new Map<Coop, Standard>(divergences)
  const versCoopExceptionnel = new Map<Standard, Coop>(
    divergences.map(([coop, valeur]) => [valeur, coop] as const),
  )
  const nomParValeur = new Map<Standard, string>(
    Object.entries(standard).map(([nom, valeur]) => [valeur, nom]),
  )
  const nomsConnus = new Set<string>(noms)

  return {
    valeurs: noms as [Coop, ...Coop[]],
    versStandard: (valeur: Coop): Standard | null =>
      versStandardExceptionnel.get(valeur) ?? standard[valeur] ?? null,
    versCoop: (valeur: Standard): Coop | null => {
      const exceptionnel = versCoopExceptionnel.get(valeur)
      if (exceptionnel != null) return exceptionnel

      const nom = nomParValeur.get(valeur)

      return nom != null && nomsConnus.has(nom) ? (nom as Coop) : null
    },
  }
}
