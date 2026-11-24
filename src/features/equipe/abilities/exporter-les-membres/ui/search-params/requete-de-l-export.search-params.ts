import { adresseAvec } from '@/libraries/parametres-d-url'
import { hrefDeLExportDeLEquipe } from '../../../../ui/presenters/liens.presenter'

const PARAMETRES_EXPORTES = ['recherche', 'statut', 'role', 'tri', 'ordre']

export const lienDExport = (
  coordinateurId: string,
  parametres: Readonly<Record<string, string | undefined>>,
): string =>
  adresseAvec(
    hrefDeLExportDeLEquipe(coordinateurId),
    Object.fromEntries(
      PARAMETRES_EXPORTES.map((cle) => [cle, parametres[cle] || null]),
    ),
  )
