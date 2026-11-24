import { requeteDeLExport } from '../../../../ui/filtres/equipe.filtre'
import { hrefDeLExportDeLEquipe } from '../../../../ui/presenters/liens.presenter'

export const lienDExport = (
  coordinateurId: string,
  parametres: Parameters<typeof requeteDeLExport>[0],
): string => {
  const requete = requeteDeLExport(parametres)
  const chemin = hrefDeLExportDeLEquipe(coordinateurId)
  return requete === '' ? chemin : `${chemin}?${requete}`
}
