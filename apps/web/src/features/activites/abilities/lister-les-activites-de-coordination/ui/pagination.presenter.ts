const PARAMETRES_DE_LA_PAGINATION = [
  'du',
  'au',
  'types',
  'tags',
  'page',
  'lignes',
] as const

export const parametresDeLaPagination = (
  parametres: Readonly<Partial<Record<string, string>>>,
): Record<string, string> =>
  Object.fromEntries(
    PARAMETRES_DE_LA_PAGINATION.flatMap((cle) => {
      const valeur = parametres[cle]
      return valeur === undefined ? [] : [[cle, valeur]]
    }),
  )
