import type { Worksheet } from 'exceljs'

export const addTitleRow =
  (worksheet: Worksheet) => (title: string, options?: { bgColor?: string }) => {
    const row = worksheet.addRow([title])
    const cell = row.getCell(1)
    cell.font = { bold: true }
    if (options?.bgColor) {
      cell.fill = {
        bgColor: { argb: options.bgColor },
        pattern: 'solid',
        type: 'pattern',
      }
    }
    row.getCell(1).font = { bold: true }

    return row
  }
