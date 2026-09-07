/**
 * Un pont entre le vocabulaire propre à la coop et celui du schéma national. La
 * table est la seule source : elle est complète — chaque nom coop y a son
 * équivalent standard — donc traduire vers le standard ne peut pas échouer.
 * L'inverse, si : une valeur du standard que la coop ne connaît pas n'a pas de
 * nom ici.
 *
 * L'énumération du standard n'est là que pour son type : sans elle, les valeurs
 * citées par la table seraient les seules que `versCoop` accepterait, alors
 * qu'elle doit répondre sur toute l'énumération.
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
    versStandard: (valeur: Coop): Standard => table[valeur],
    versCoop: (valeur: Standard): Coop | null => inverse.get(valeur) ?? null,
  }
}
