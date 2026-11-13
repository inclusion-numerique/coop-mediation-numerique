const PARAMETRES_EXPORTES = ['du', 'au', 'types', 'tags'] as const

export const requeteDeLExport = (
  parametres: Readonly<Partial<Record<string, string>>>,
): string =>
  new URLSearchParams(
    PARAMETRES_EXPORTES.flatMap((cle) => {
      const valeur = parametres[cle]
      return valeur === undefined ? [] : [[cle, valeur]]
    }),
  ).toString()
