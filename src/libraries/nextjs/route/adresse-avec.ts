type Changements = Readonly<Record<string, string | null | undefined>>

const fusionnee = (requete: string, parametres: Changements): string =>
  new URLSearchParams(
    Object.entries({
      ...Object.fromEntries(new URLSearchParams(requete)),
      ...parametres,
    }).flatMap(([nom, valeur]) => (valeur == null ? [] : [[nom, valeur]])),
  ).toString()

export const adresseAvec = (
  adresse: string,
  parametres: Changements,
): string => {
  const [chemin = '', requete = ''] = adresse.split('?')
  const chaine = fusionnee(requete, parametres)
  return chaine === '' ? chemin : `${chemin}?${chaine}`
}
