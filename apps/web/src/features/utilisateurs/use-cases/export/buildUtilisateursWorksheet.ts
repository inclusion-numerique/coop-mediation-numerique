import {
  WorksheetUser,
  addExportMetadata,
} from '@app/web/libs/worksheet/addExportMetadata'
import { addFilters } from '@app/web/libs/worksheet/addFilters'
import { addTitleRow } from '@app/web/libs/worksheet/addTitleRow'
import { autosizeColumns } from '@app/web/libs/worksheet/autosizeColumns'
import { setWorkbookMetadata } from '@app/web/libs/worksheet/setWorkbookMetadata'
import * as Excel from 'exceljs'
import { UtilisateursFiltersLabels } from '../filter/generateUtilisateursFiltersLabels'
import { UtilisateursDataTable } from '../list/UtilisateursDataTable'
import { UtilisateurForList } from '../list/queryUtilisateursForList'

const availableFilters = [
  { label: 'Rôles', type: 'roles' },
  { label: 'Dispositif', type: 'conseiller_numerique' },
  { label: 'Statut', type: 'statut' },
  { label: 'Lieux', type: 'lieux' },
  { label: 'Communes', type: 'communes' },
  { label: 'Départements', type: 'departements' },
]

export type BuildUtilisateursWorksheetInput = {
  user: WorksheetUser
  filters: UtilisateursFiltersLabels
  utilisateurs: UtilisateurForList[]
  worksheetGenerationDate?: Date
}

export const buildUtilisateursWorksheet = ({
  utilisateurs,
  user,
  filters,
  worksheetGenerationDate = new Date(),
}: BuildUtilisateursWorksheetInput): Excel.Workbook => {
  const workbook = new Excel.Workbook()

  setWorkbookMetadata(workbook)

  const worksheet = workbook.addWorksheet('Utilisateurs')

  addExportMetadata(worksheet)({
    user,
    date: worksheetGenerationDate,
    total: utilisateurs.length,
  })

  addTitleRow(worksheet)('Filtres')
  addFilters(worksheet, availableFilters)(filters)

  const tableHeaders = UtilisateursDataTable.columns.map(
    ({ csvHeaders }) => csvHeaders,
  )

  const separatorRowBeforeTable = worksheet.addRow([''])

  const tableStartRowNumber = separatorRowBeforeTable.number + 1

  worksheet.addTable({
    name: 'Utilisateurs',
    ref: `A${tableStartRowNumber}`,
    headerRow: true,
    totalsRow: false,
    columns: tableHeaders.flat().map((label) => ({
      name: label,
      filterButton: true,
    })),
    rows: utilisateurs.map((utilisateur) =>
      UtilisateursDataTable.columns
        .map(({ csvValues }) => csvValues(utilisateur))
        .filter(Boolean)
        .flat(),
    ),
  })

  const dateColumnIndex = 1
  worksheet
    .getColumn(dateColumnIndex)
    .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber >= tableStartRowNumber && cell.value) {
        cell.numFmt = 'dd/mm/yyyy' // Set date format only for rows starting from tableStartRowNumber
      }
    })

  // Ensure that the rows auto-adjust their height to fit the wrapped text and displays break lines
  worksheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' }
  })

  autosizeColumns(worksheet)

  return workbook
}
