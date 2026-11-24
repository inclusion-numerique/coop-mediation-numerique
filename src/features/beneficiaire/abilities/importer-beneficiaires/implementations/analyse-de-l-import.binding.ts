import { type Analysis, analyserLaFeuille } from '../domain/analyse-de-l-import'
import type { FeuilleImport } from '../domain/feuille-import'
import { clientDesCommunes } from './fichier/communes'

export const analyseImportBeneficiairesExcel = async (
  feuille: FeuilleImport,
): Promise<Analysis> => analyserLaFeuille(await clientDesCommunes())(feuille)
