import type { Worksheet } from 'exceljs'
import Excel from 'exceljs'
import { importBeneficiaireWorksheetName } from './analyseImportBeneficiairesExcel'
import { getBeneficiaireImportSheet } from './getBeneficiaireImportSheet'

const classeur = async (
  ...feuilles: ReadonlyArray<readonly [string, (feuille: Worksheet) => void]>
): Promise<Buffer> => {
  const workbook = feuilles.reduce((enCours, [nom, remplir]) => {
    remplir(enCours.addWorksheet(nom))
    return enCours
  }, new Excel.Workbook())
  return Buffer.from(await workbook.xlsx.writeBuffer())
}

describe('getBeneficiaireImportSheet', () => {
  it('should leave empty the cells hidden by a merge', async () => {
    const fichier = await classeur([
      importBeneficiaireWorksheetName,
      (feuille) => {
        feuille.addRows([
          ['Commune', null, null],
          ['Nom', 'Code INSEE', 'Code postal'],
        ])
        feuille.mergeCells('A1:C1')
      },
    ])

    expect(await getBeneficiaireImportSheet(fichier)).toEqual([
      ['Commune', null, null],
      ['Nom', 'Code INSEE', 'Code postal'],
    ])
  })

  it('should read the import sheet when it is not the first one', async () => {
    const fichier = await classeur(
      [
        'Communes',
        (feuille) => {
          feuille.addRows([['Blaziert', '32057', '32100']])
        },
      ],
      [
        importBeneficiaireWorksheetName,
        (feuille) => {
          feuille.addRows([['Exemple', 'Léa', 1970]])
        },
      ],
    )

    expect(await getBeneficiaireImportSheet(fichier)).toEqual([
      ['Exemple', 'Léa', 1970],
    ])
  })

  it('should keep the position of the rows after an empty one', async () => {
    const fichier = await classeur([
      importBeneficiaireWorksheetName,
      (feuille) => {
        feuille.getRow(1).values = ['Instructions']
        feuille.getRow(3).values = ['Nom']
      },
    ])

    expect(await getBeneficiaireImportSheet(fichier)).toEqual([
      ['Instructions'],
      [],
      ['Nom'],
    ])
  })

  it('should reject a file without the import sheet', async () => {
    const fichier = await classeur([
      'Communes',
      (feuille) => {
        feuille.addRows([['Blaziert']])
      },
    ])

    await expect(getBeneficiaireImportSheet(fichier)).rejects.toThrow(
      `Le fichier n'a pas de feuille "${importBeneficiaireWorksheetName}"`,
    )
  })
})
