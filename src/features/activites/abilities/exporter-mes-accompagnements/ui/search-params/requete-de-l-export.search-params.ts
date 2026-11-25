export const cheminAvecRequete = (chemin: string, requete: string): string =>
  requete === '' ? chemin : `${chemin}?${requete}`
