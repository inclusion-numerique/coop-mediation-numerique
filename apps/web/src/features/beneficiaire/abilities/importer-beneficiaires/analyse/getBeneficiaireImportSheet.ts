import { Readable } from 'node:stream'
import type { CellValue, Row, stream } from 'exceljs'
import Excel from 'exceljs'
import { importBeneficiaireWorksheetName } from './analyseImportBeneficiairesExcel'
import type { FeuilleImport, ValeurCellule } from './feuille-import'

type ValeurStructuree = Exclude<
  CellValue,
  null | undefined | number | string | boolean | Date
>

type FeuilleEnFlux = stream.xlsx.WorksheetReader

const millisecondesParJour = 86_400_000

const numeroSerieExcelDuPremierJanvier1970 = 25_569

const optionsDeLecture = {
  worksheets: 'emit',
  sharedStrings: 'cache',
  styles: 'cache',
  hyperlinks: 'ignore',
  entries: 'ignore',
} satisfies stream.xlsx.WorkbookStreamReaderOptions

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

const lireLigne = (ligne: Row): ValeurCellule[] =>
  Array.from({ length: ligne.cellCount }, (_, indexColonne) =>
    normaliserValeurCellule(ligne.getCell(indexColonne + 1).value),
  )

const lireFeuille = (lignes: Row[]): FeuilleImport => {
  const lignesParNumero = new Map(lignes.map((ligne) => [ligne.number, ligne]))
  const nombreDeLignes = lignes.reduce(
    (dernier, { number }) => Math.max(dernier, number),
    0,
  )

  return Array.from({ length: nombreDeLignes }, (_, indexLigne) => {
    const ligne = lignesParNumero.get(indexLigne + 1)
    return ligne == null ? [] : lireLigne(ligne)
  })
}

const porteLeNom = (feuille: FeuilleEnFlux, nom: string): boolean =>
  'name' in feuille && feuille.name === nom

const feuilleNommee = async (
  feuilles: AsyncGenerator<FeuilleEnFlux>,
  nom: string,
): Promise<FeuilleEnFlux | null> => {
  const suivante = await feuilles.next()
  if (suivante.done) {
    return null
  }
  if (porteLeNom(suivante.value, nom)) {
    return suivante.value
  }
  await Array.fromAsync(suivante.value)
  return feuilleNommee(feuilles, nom)
}

export const getBeneficiaireImportSheet = async (
  data: Buffer,
): Promise<FeuilleImport> => {
  const feuilles = new Excel.stream.xlsx.WorkbookReader(
    Readable.from([data]),
    optionsDeLecture,
  )[Symbol.asyncIterator]()

  const feuille = await feuilleNommee(feuilles, importBeneficiaireWorksheetName)
  if (!feuille) {
    throw new Error(
      `Le fichier n'a pas de feuille "${importBeneficiaireWorksheetName}"`,
    )
  }

  const lignes = await Array.fromAsync(feuille)
  await feuilles.return(undefined)

  return lireFeuille(lignes)
}
