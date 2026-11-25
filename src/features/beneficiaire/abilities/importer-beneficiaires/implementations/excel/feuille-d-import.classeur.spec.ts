import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { CellValue, Worksheet } from 'exceljs'
import Excel from 'exceljs'
import { describe, expect, it } from 'vitest'
import { importBeneficiaireWorksheetName } from '../../domain/analyse-de-l-import'
import { getBeneficiaireImportSheet } from './feuille-d-import.classeur'

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

const cheminDuModele = path.resolve(
  __dirname,
  '../../../../../../../public/modeles/coop-numerique_import-beneficiaires.xlsx',
)

describe('lecture des fichiers d’import', { timeout: 10_000 }, () => {
  it('lit la ligne d’exemple du modèle téléchargeable', async () => {
    const feuille = await getBeneficiaireImportSheet(
      readFileSync(cheminDuModele),
    )

    expect(feuille[3]).toEqual([
      'Exemple',
      'Léa',
      1970,
      'Blaziert',
      '32057',
      '32100',
      '0102030405',
      null,
      'Féminin',
    ])
  })

  it('lit un fichier enregistré avec des erreurs de saisie', async () => {
    const feuille = await getBeneficiaireImportSheet(
      readFileSync(
        path.resolve(
          __dirname,
          '../../../../fixtures/import-avec-erreurs.xlsx',
        ),
      ),
    )

    expect(feuille.slice(3, 6)).toEqual([
      [
        'Exemple',
        'Léa',
        1970,
        'Bourg-en-Bresse',
        '01053',
        '01000',
        '0102030405',
        null,
        'Féminin',
      ],
      ['Exemple', null, 1970, null, 0, 0, null, null, null],
      [null, 'Albert', 'nuage', null, 0, 0, null, null, null],
    ])
  })

  it('lit le texte riche, le résultat des formules et le texte des liens', async () => {
    const fichier = await classeur([
      importBeneficiaireWorksheetName,
      (feuille) => {
        feuille.addRows([
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
      },
    ])

    expect(await getBeneficiaireImportSheet(fichier)).toEqual([
      [
        'Exemple',
        'Léa',
        1970,
        'Blaziert',
        '32057',
        32100,
        '0102030405',
        'lea@exemple.fr',
        'Féminin',
      ],
      [null, null, null, null, null],
    ])
  })

  it('lit une date comme son numéro de série Excel', async () => {
    const fichier = await classeur([
      importBeneficiaireWorksheetName,
      (feuille) => {
        feuille.addRows([['Exemple', 'Léa', new Date(Date.UTC(1970, 0, 1))]])
      },
    ])

    expect(await getBeneficiaireImportSheet(fichier)).toEqual([
      ['Exemple', 'Léa', 25_569],
    ])
  })
})

describe('modèle téléchargeable', () => {
  const premiereLigneBeneficiaires = 4
  const derniereLigneBeneficiaires = 3117

  const modele = async () => {
    const workbook = new Excel.Workbook()
    await workbook.xlsx.readFile(cheminDuModele)
    return workbook
  }

  const communesDuModele = async () => {
    const lignes = (await modele()).getWorksheet('Communes')?.getSheetValues()
    return (lignes ?? [])
      .slice(2)
      .filter((ligne): ligne is CellValue[] => Array.isArray(ligne))
      .map((ligne) => String(ligne[1]))
  }

  const lignesDeSaisie = Array.from(
    { length: derniereLigneBeneficiaires - premiereLigneBeneficiaires + 1 },
    (_, index) => premiereLigneBeneficiaires + index,
  )

  it('liste toutes les communes', async () => {
    expect(await communesDuModele()).toHaveLength(35_071)
  }, 30_000)

  it('désigne chaque commune par un libellé unique', async () => {
    const libelles = await communesDuModele()

    expect(new Set(libelles).size).toBe(libelles.length)
  }, 30_000)

  it('calcule les codes de la commune sur toutes les lignes de saisie', async () => {
    const feuille = (await modele()).getWorksheet(
      importBeneficiaireWorksheetName,
    )

    const lignesSansFormule = lignesDeSaisie.filter(
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

    const lignesSansListe = lignesDeSaisie.filter(
      (ligne) =>
        feuille?.getCell(`D${ligne}`).dataValidation?.formulae?.[0] !==
        'Communes!$A$2:$A$35072',
    )

    expect(lignesSansListe).toEqual([])
  }, 30_000)

  it('range les communes homonymes côte à côte', async () => {
    const libelles = await communesDuModele()

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
