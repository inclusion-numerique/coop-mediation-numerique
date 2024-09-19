import path from 'node:path'
import ExcelJS from 'exceljs'
import { readFileSync } from 'node:fs'
import {
  analyseImportBeneficiairesExcel,
  AnalysisSchema,
} from '@app/web/beneficiaire/import/analyseImportBeneficiairesExcel'

const loadLocalExcelFile = async (file: string) => {
  const filePath = path.resolve(__dirname, `./_test/${file}`)

  const fileBuffer = readFileSync(filePath)

  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.load(fileBuffer)

  return workbook
}

describe('analyseImportBeneficiairesExcel', () => {
  it('should parse a valid excel file', async () => {
    const workbook = await loadLocalExcelFile(
      'import-beneficiaires_modele.xlsx',
    )

    const result = await analyseImportBeneficiairesExcel(workbook)

    expect(result).toEqual({
      status: 'ok',
      rows: [
        {
          values: {
            nom: 'Exemple',
            prenom: 'Léa',
            anneeNaissance: 1970,
            numeroTelephone: '0102030405',
            communeCodeInsee: '32057',
            communeNom: 'Blaziert',
            communeCodePostal: '32100',
            email: undefined,
            genre: 'Féminin',
            notesSupplementaires: undefined,
          },
          parsed: {
            anneeNaissance: 1970,
            genre: 'Feminin',
            commune: {
              codePostal: '32100',
              nom: 'Blaziert',
              codeInsee: '32057',
            },
          },
        },
      ],
    })

    expect(AnalysisSchema.safeParse(result).error).toBe(undefined)
  })

  it('should parse an excel with errors', async () => {
    const workbook = await loadLocalExcelFile('import-beneficiaire_errors.xlsx')
    const result = await analyseImportBeneficiairesExcel(workbook)

    expect(result).toEqual({
      status: 'error',
      rows: [
        {
          values: {
            nom: null,
            prenom: 'Léa',
            anneeNaissance: 1970,
            numeroTelephone: '0102030405',
            communeCodeInsee: '32057',
            communeNom: 'Blaziert',
            communeCodePostal: '32100',
            email: undefined,
            genre: 'Féminin',
            notesSupplementaires: undefined,
          },
          parsed: {
            genre: 'Feminin',
            commune: {
              codePostal: '32100',
              nom: 'Blaziert',
              codeInsee: '32057',
            },
          },
          errors: {
            nom: 'Le nom est obligatoire',
          },
        },
      ],
    })

    expect(AnalysisSchema.safeParse(result).error).toBe(undefined)
  })
})
