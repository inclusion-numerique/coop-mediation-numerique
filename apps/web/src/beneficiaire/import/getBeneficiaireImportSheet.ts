import { importBeneficiaireWorksheetName } from '@app/web/beneficiaire/import/analyseImportBeneficiairesExcel'
import XLSX, { type WorkSheet } from 'xlsx'

export const getBeneficiaireImportSheet = (
  data: Buffer | ArrayBuffer,
): WorkSheet => {
  const workbook = XLSX.read(data, {
    type: 'buffer',
    sheets: [importBeneficiaireWorksheetName],
  })

  const sheet = workbook.Sheets[importBeneficiaireWorksheetName]
  if (!sheet) {
    throw new Error(
      `Le fichier n'a pas de feuille "${importBeneficiaireWorksheetName}"`,
    )
  }

  return sheet
}
