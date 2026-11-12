import {
  addExportMetadata,
  type WorksheetUser,
} from '@app/web/libs/worksheet/addExportMetadata'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import { addFilters } from '@app/web/worksheet/buildWorksheetHelpers'
import Excel from 'exceljs'
import type { ExportDesAccompagnements } from '../domain'
import {
  entetesDuClasseur,
  lignesDuClasseur,
  nombreDAccompagnementsExportes,
} from './lignes-du-classeur.presenter'

export type LibelleDeFiltre = { readonly type: string; readonly label: string }

const COLONNE_DE_LA_DATE = 1

export const classeurDesAccompagnements = ({
  demandeur,
  filtres,
  exportDes: { activites, colonnes },
  date = new Date(),
}: {
  readonly demandeur: WorksheetUser
  readonly filtres: readonly LibelleDeFiltre[]
  readonly exportDes: ExportDesAccompagnements
  readonly date?: Date
}): Excel.Workbook => {
  const classeur = new Excel.Workbook()
  setWorkbookMetadata(classeur)({ worksheetGenerationDate: date })
  const feuille = classeur.addWorksheet('Activités')

  addExportMetadata(feuille)({
    user: demandeur,
    date,
    total: nombreDAccompagnementsExportes(activites),
  })
  addFilters(feuille)(filtres, { mediateurScope: null })

  const premiereLigneDuTableau = feuille.addRow(['']).number + 1

  feuille.addTable({
    name: 'Activités',
    ref: `A${premiereLigneDuTableau}`,
    headerRow: true,
    totalsRow: false,
    columns: entetesDuClasseur(colonnes).map((name) => ({
      name,
      filterButton: true,
    })),
    rows: lignesDuClasseur(activites, colonnes).map((ligne) => [...ligne]),
  })

  feuille
    .getColumn(COLONNE_DE_LA_DATE)
    .eachCell({ includeEmpty: true }, (cellule, numero) => {
      if (numero >= premiereLigneDuTableau && cellule.value) {
        cellule.numFmt = 'dd/mm/yyyy'
      }
    })
  feuille.eachRow((ligne) => {
    ligne.alignment = { wrapText: true, vertical: 'top' }
  })
  autosizeColumns(feuille)

  return classeur
}
