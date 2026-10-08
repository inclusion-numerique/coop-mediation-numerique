import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { CellValue } from 'exceljs'
import Excel from 'exceljs'
import {
  AnalysisSchema,
  analyseImportBeneficiairesExcel,
  importBeneficiaireWorksheetName,
} from './analyseImportBeneficiairesExcel'
import { getBeneficiaireImportSheet } from './getBeneficiaireImportSheet'

const enTetes: ReadonlyArray<ReadonlyArray<CellValue>> = [
  ['Instructions'],
  ['Nom', 'Prénom', 'Année de naissance', 'Commune', 'Commune', 'Commune'],
  ['Nom', 'Prénom', 'Année de naissance', 'Nom', 'Code INSEE', 'Code postal'],
]

const feuilleDepuisLignes = async (
  lignes: ReadonlyArray<ReadonlyArray<CellValue>>,
) => {
  const workbook = new Excel.Workbook()
  workbook
    .addWorksheet(importBeneficiaireWorksheetName)
    .addRows([...enTetes, ...lignes].map((ligne) => [...ligne]))
  const contenu = await workbook.xlsx.writeBuffer()
  return getBeneficiaireImportSheet(Buffer.from(contenu))
}

const getSheetFromLocalFile = (file: string) => {
  const filePath = path.resolve(__dirname, `./_test/${file}`)

  const fileBuffer = readFileSync(filePath)

  return getBeneficiaireImportSheet(fileBuffer)
}

jest.setTimeout(10_000)

describe('analyseImportBeneficiairesExcel', () => {
  it('should parse the downloadable model xlsx file', async () => {
    const workbook = await getSheetFromLocalFile(
      '../../../../../../../public/modeles/coop-numerique_import-beneficiaires.xlsx',
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
            email: null,
            genre: 'Féminin',
            notesSupplementaires: null,
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
    const workbook = await getSheetFromLocalFile(
      'import-beneficiaire_errors.xlsx',
    )
    const result = await analyseImportBeneficiairesExcel(workbook)

    expect(result).toEqual({
      status: 'error',
      rows: [
        {
          values: {
            nom: 'Exemple',
            prenom: 'Léa',
            anneeNaissance: 1970,
            numeroTelephone: '0102030405',
            communeCodeInsee: '01053',
            communeNom: 'Bourg-en-Bresse',
            communeCodePostal: '01000',
            email: null,
            genre: 'Féminin',
            notesSupplementaires: null,
          },
          parsed: {
            genre: 'Feminin',
            anneeNaissance: 1970,
            commune: {
              codePostal: '01000',
              nom: 'Bourg-en-Bresse',
              codeInsee: '01053',
            },
          },
        },
        {
          values: {
            nom: 'Exemple',
            prenom: null,
            anneeNaissance: 1970,
            numeroTelephone: null,
            communeCodeInsee: null,
            communeNom: null,
            communeCodePostal: null,
            email: null,
            genre: null,
            notesSupplementaires: null,
          },
          parsed: {
            genre: 'NonCommunique',
            anneeNaissance: 1970,
            commune: null,
          },
          errors: {
            prenom: 'Le prénom est obligatoire',
          },
        },
        {
          values: {
            nom: null,
            prenom: 'Albert',
            anneeNaissance: null,
            numeroTelephone: null,
            communeCodeInsee: null,
            communeNom: null,
            communeCodePostal: null,
            email: null,
            genre: null,
            notesSupplementaires: null,
          },
          parsed: {
            genre: 'NonCommunique',
            anneeNaissance: null,
            commune: null,
          },
          errors: {
            nom: 'Le nom est obligatoire',
          },
        },
      ],
    })

    expect(AnalysisSchema.safeParse(result).error).toBe(undefined)
  })

  it('should read rich text, formula results and hyperlinks as plain values', async () => {
    const feuille = await feuilleDepuisLignes([
      [
        { richText: [{ text: 'Exem' }, { text: 'ple' }] },
        'Léa',
        { formula: '1900+70', result: 1970 },
        'Blaziert',
        { formula: 'VLOOKUP(D4,Communes!A:B,2,0)', result: '32057' },
        { formula: 'VLOOKUP(D4,Communes!A:C,3,0)', result: 32100 },
        '0102030405',
        { text: 'lea@exemple.fr', hyperlink: 'mailto:lea@exemple.fr' },
        'Féminin',
      ],
      [null, null, null, null, { formula: 'IF(D5="","",D5)' }],
    ])

    const result = await analyseImportBeneficiairesExcel(feuille)

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
            email: 'lea@exemple.fr',
            genre: 'Féminin',
            notesSupplementaires: null,
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
  })

  it('should read a date as its excel serial number', async () => {
    const feuille = await feuilleDepuisLignes([
      ['Exemple', 'Léa', new Date(Date.UTC(1970, 0, 1))],
    ])

    const result = await analyseImportBeneficiairesExcel(feuille)

    expect(result.status).toBe('error')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].values.anneeNaissance).toBe(25_569)
    expect(result.rows[0].errors).toEqual({
      anneeNaissance: 'Veuillez renseigner une année de naissance valide',
    })
  })
})
