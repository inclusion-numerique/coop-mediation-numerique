import path from 'node:path'
import type { CellValue } from 'exceljs'
import Excel from 'exceljs'
import { describe, expect, it } from 'vitest'
import { analyserLaFeuille } from '../../domain/analyse-de-l-import'
import { clientDesCommunes } from './communes.query'

const communesDuModele = async () => {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(
    path.resolve(
      __dirname,
      '../../../../../../../public/modeles/coop-numerique_import-beneficiaires.xlsx',
    ),
  )
  const lignes = workbook.getWorksheet('Communes')?.getSheetValues()
  return (lignes ?? [])
    .slice(2)
    .filter((ligne): ligne is CellValue[] => Array.isArray(ligne))
    .map((ligne) => ({
      libelle: String(ligne[1]),
      codeInsee: String(ligne[2]),
      codePostal: ligne[3] == null ? null : String(ligne[3]),
    }))
}

describe('communes du référentiel', () => {
  it("acceptent chaque libellé proposé par le modèle d'import", async () => {
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

    const result = analyserLaFeuille(await clientDesCommunes())(feuille)

    expect(result.rows.filter((row) => row.errors)).toEqual([])
  }, 60_000)
})
