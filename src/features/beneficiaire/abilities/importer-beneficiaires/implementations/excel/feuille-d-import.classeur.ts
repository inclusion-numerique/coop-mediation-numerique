import { Readable } from 'node:stream'
import type { Cell, CellValue, Row } from 'exceljs'
import Excel from 'exceljs'
import { importBeneficiaireWorksheetName } from '../../domain/analyse-de-l-import'
import type { FeuilleImport, ValeurCellule } from '../../domain/feuille-import'

type ValeurStructuree = Exclude<
  CellValue,
  null | undefined | number | string | boolean | Date
>

const millisecondesParJour = 86_400_000

const numeroSerieExcelDuPremierJanvier1970 = 25_569

const numeroSerieExcel = (date: Date): number =>
  date.getTime() / millisecondesParJour + numeroSerieExcelDuPremierJanvier1970

const valeurStructuree = (valeur: ValeurStructuree): ValeurCellule => {
  if ('richText' in valeur) {
    return valeur.richText.map(({ text }) => text).join('')
  }
  if ('hyperlink' in valeur) {
    return normaliserValeurCellule(valeur.text)
  }
  if ('error' in valeur) {
    return valeur.error
  }
  return normaliserValeurCellule(valeur.result)
}

const normaliserValeurCellule = (valeur: CellValue): ValeurCellule => {
  if (valeur === null || valeur === undefined) {
    return null
  }
  if (valeur instanceof Date) {
    return numeroSerieExcel(valeur)
  }
  if (typeof valeur === 'object') {
    return valeurStructuree(valeur)
  }
  return valeur
}

const estMasqueeParUneFusion = (cellule: Cell): boolean =>
  cellule.isMerged && cellule.master !== cellule

const lireCellule = (cellule: Cell): ValeurCellule =>
  estMasqueeParUneFusion(cellule)
    ? null
    : normaliserValeurCellule(cellule.value)

const lireLigne = (ligne: Row): ValeurCellule[] =>
  Array.from({ length: ligne.cellCount }, (_, indexColonne) =>
    lireCellule(ligne.getCell(indexColonne + 1)),
  )

export const getBeneficiaireImportSheet = async (
  data: Buffer,
): Promise<FeuilleImport> => {
  const classeur = await new Excel.Workbook().xlsx.read(Readable.from([data]))
  const feuille = classeur.getWorksheet(importBeneficiaireWorksheetName)
  if (!feuille) {
    throw new Error(
      `Le fichier n'a pas de feuille "${importBeneficiaireWorksheetName}"`,
    )
  }

  return Array.from({ length: feuille.rowCount }, (_, indexLigne) => {
    const ligne = feuille.findRow(indexLigne + 1)
    return ligne === undefined ? [] : lireLigne(ligne)
  })
}
