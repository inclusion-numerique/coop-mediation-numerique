import type { Workbook } from 'exceljs'

export const setWorkbookMetadata =
  (workbook: Workbook) =>
  ({ worksheetGenerationDate }: { worksheetGenerationDate: Date }) => {
    workbook.creator = 'La Coop de la médiation numérique'
    workbook.lastModifiedBy = 'La Coop de la médiation numérique'
    workbook.created = worksheetGenerationDate
    workbook.modified = worksheetGenerationDate
    workbook.lastPrinted = worksheetGenerationDate
  }
