import * as Excel from 'exceljs'
import {
  type AuteurDExport,
  addExportMetadata,
} from '@/libraries/tableur/add-export-metadata'
import { addTitleRow } from '@/libraries/tableur/add-title-row'
import { autosizeColumns } from '@/libraries/tableur/autosize-columns'
import { setWorkbookMetadata } from '@/libraries/tableur/set-workbook-metadata'

type Cellule = string | number | Date

export const classeurDesCoordinations = ({
  entetes,
  lignes,
  filtres,
  auteur,
  fuseau,
  genereLe = new Date(),
}: {
  entetes: readonly string[]
  lignes: readonly (readonly Cellule[])[]
  filtres: readonly (readonly string[])[]
  auteur: AuteurDExport
  fuseau: string
  genereLe?: Date
}): Excel.Workbook => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)

  const feuille = classeur.addWorksheet('Activités de coordination')
  addExportMetadata(feuille)({
    auteur: auteur,
    date: genereLe,
    fuseau,
    total: lignes.length,
  })

  addTitleRow(feuille)('Filtres')
  feuille.addRows([...filtres.map((ligne) => [...ligne]), []])

  const debutDuTableau = feuille.addRow(['']).number + 1

  feuille.addTable({
    name: 'Activites_de_coordination',
    ref: `A${debutDuTableau}`,
    headerRow: true,
    totalsRow: false,
    columns: entetes.map((name) => ({ name, filterButton: true })),
    rows: lignes.map((ligne) => [...ligne]),
  })

  feuille.getColumn(1).eachCell({ includeEmpty: true }, (cellule, rang) => {
    if (rang >= debutDuTableau && cellule.value) cellule.numFmt = 'dd/mm/yyyy'
  })

  feuille.eachRow((ligne) => {
    ligne.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(feuille)

  return classeur
}
