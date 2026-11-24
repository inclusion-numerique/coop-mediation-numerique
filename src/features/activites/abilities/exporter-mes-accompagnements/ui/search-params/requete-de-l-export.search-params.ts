import type { FiltresDeLaListe } from '../../../../ui/search-params/filtres-de-la-liste.search-params'

export const requeteDeLExport = (filtres: FiltresDeLaListe): string =>
  new URLSearchParams(
    Object.entries(filtres).flatMap(([cle, valeur]) => {
      const texte = Array.isArray(valeur) ? valeur.join(',') : (valeur ?? '')
      return texte === '' ? [] : [[cle, texte]]
    }),
  ).toString()

export const cheminAvecRequete = (chemin: string, requete: string): string =>
  requete === '' ? chemin : `${chemin}?${requete}`
