export const cellules = (ligne: string): readonly string[] =>
  (ligne.match(/("([^"]|"")*"|[^,]*)(,|$)/gu) ?? []).map((brut) =>
    brut.replace(/,$/u, '').replace(/^"|"$/gu, '').replaceAll('""', '"'),
  )

export const lots = <T>(
  valeurs: readonly T[],
  taille: number,
): readonly (readonly T[])[] =>
  valeurs.length === 0
    ? []
    : [valeurs.slice(0, taille), ...lots(valeurs.slice(taille), taille)]

/** Dépouille la réponse de la Base Adresse Nationale, ligne à ligne. */
export const ligneDuTableau = <T>(
  reponse: string,
  depuis: (
    colonnes: readonly string[],
    ligne: readonly string[],
  ) => readonly T[],
): readonly T[] => {
  const [entete, ...lignes] = reponse
    .split('\n')
    .filter((ligne) => ligne.trim() !== '')

  if (entete == null) return []

  const colonnes = cellules(entete)

  return lignes.flatMap((ligne) => depuis(colonnes, cellules(ligne)))
}
