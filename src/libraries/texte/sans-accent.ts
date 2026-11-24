const sansAccent = (texte: string): string =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const contientSansAccent = (texte: string, recherche: string): boolean =>
  sansAccent(texte).includes(sansAccent(recherche))
