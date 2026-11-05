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

  it('accepte une commune homonyme désignée par son nom et son code postal', async () => {
    const feuille = await feuilleDepuisLignes([
      ['Exemple', 'Léa', 1970, 'Lieusaint (77127)', '77251', '77127'],
    ])

    const result = await analyseImportBeneficiairesExcel(feuille)

    expect(result.status).toBe('ok')
    expect(result.rows[0].parsed.commune).toEqual({
      codeInsee: '77251',
      nom: 'Lieusaint',
      codePostal: '77127',
    })
  })

  it('accepte encore le nom seul des modèles déjà téléchargés', async () => {
    const feuille = await feuilleDepuisLignes([
      ['Exemple', 'Léa', 1970, 'Lieusaint', '77251', '77127'],
    ])

    const result = await analyseImportBeneficiairesExcel(feuille)

    expect(result.status).toBe('ok')
  })

  it("refuse le libellé d'une autre commune homonyme", async () => {
    const feuille = await feuilleDepuisLignes([
      ['Exemple', 'Léa', 1970, 'Lieusaint (50700)', '77251', '77127'],
    ])

    const result = await analyseImportBeneficiairesExcel(feuille)

    expect(result.rows[0].errors).toEqual({
      communeNom: 'Le nom de la commune ne correspond pas',
    })
  })

  describe('modèle téléchargeable', () => {
    const premiereLigneBeneficiaires = 4
    const derniereLigneBeneficiaires = 3117

    const modele = async () => {
      const workbook = new Excel.Workbook()
      await workbook.xlsx.readFile(
        path.resolve(
          __dirname,
          '../../../../../../public/modeles/coop-numerique_import-beneficiaires.xlsx',
        ),
      )
      return workbook
    }

    const communesDuModele = async () => {
      const lignes = (await modele()).getWorksheet('Communes')?.getSheetValues()
      return (lignes ?? [])
        .slice(2)
        .filter((ligne): ligne is CellValue[] => Array.isArray(ligne))
        .map((ligne) => ({
          libelle: String(ligne[1]),
          codeInsee: String(ligne[2]),
          codePostal: ligne[3] == null ? null : String(ligne[3]),
        }))
    }

    it('désigne chaque commune par un libellé unique', async () => {
      const libelles = (await communesDuModele()).map(({ libelle }) => libelle)

      expect(libelles).toHaveLength(35_071)
      expect(new Set(libelles).size).toBe(libelles.length)
    }, 30_000)

    it("propose des libellés que l'import accepte", async () => {
      const communes = await communesDuModele()
      const feuille = [
        [],
        [],
        [],
        ...communes
          .filter(({ codePostal }) => codePostal != null)
          .map(({ libelle, codeInsee, codePostal }) => [
            'Exemple',
            'Léa',
            1970,
            libelle,
            codeInsee,
            codePostal,
          ]),
      ]

      const result = await analyseImportBeneficiairesExcel(feuille)

      expect(result.rows.filter((row) => row.errors)).toEqual([])
    }, 60_000)

    it('calcule les codes de la commune sur toutes les lignes de saisie', async () => {
      const feuille = (await modele()).getWorksheet(
        importBeneficiaireWorksheetName,
      )
      const lignes = Array.from(
        {
          length: derniereLigneBeneficiaires - premiereLigneBeneficiaires + 1,
        },
        (_, index) => premiereLigneBeneficiaires + index,
      )

      const lignesSansFormule = lignes.filter(
        (ligne) =>
          feuille?.getCell(`E${ligne}`).formula == null ||
          feuille?.getCell(`F${ligne}`).formula == null,
      )

      expect(lignesSansFormule).toEqual([])
    }, 30_000)

    it('propose une liste limitée aux communes sur toutes les lignes de saisie', async () => {
      const feuille = (await modele()).getWorksheet(
        importBeneficiaireWorksheetName,
      )
      const lignes = Array.from(
        {
          length: derniereLigneBeneficiaires - premiereLigneBeneficiaires + 1,
        },
        (_, index) => premiereLigneBeneficiaires + index,
      )

      const lignesSansListe = lignes.filter(
        (ligne) =>
          feuille?.getCell(`D${ligne}`).dataValidation?.formulae?.[0] !==
          'Communes!$A$2:$A$35072',
      )

      expect(lignesSansListe).toEqual([])
    }, 30_000)

    it('range les communes homonymes côte à côte', async () => {
      const libelles = (await communesDuModele()).map(({ libelle }) => libelle)

      expect(libelles.indexOf('Lieusaint (77127)')).toBe(
        libelles.indexOf('Lieusaint (50700)') + 1,
      )
    }, 30_000)

    it('indique les codes postaux possibles pour un nom porté par plusieurs communes', async () => {
      const lignes = (await modele()).getWorksheet('Communes')?.getSheetValues()
      const aide = (lignes ?? [])
        .filter((ligne): ligne is CellValue[] => Array.isArray(ligne))
        .find((ligne) => ligne[4] === 'Lieusaint')

      expect(aide?.[5]).toBe('50700 ou 77127')
    }, 30_000)
  })

  it('refuse un nom porté par plusieurs communes tant que le code postal manque', async () => {
    const feuille = await feuilleDepuisLignes([
      [
        'Exemple',
        'Léa',
        1970,
        'Lieusaint',
        'Précisez : Lieusaint (code postal)',
        '50700 ou 77127',
      ],
    ])

    const result = await analyseImportBeneficiairesExcel(feuille)

    expect(result.rows[0].parsed.commune).toBeNull()
    expect(result.rows[0].errors).toEqual({
      communeCodeInsee: 'Code commune non trouvé',
    })
  })
})
