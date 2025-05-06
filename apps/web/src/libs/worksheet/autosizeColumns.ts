import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import type { Worksheet } from 'exceljs'

export type AutosizeColumnsOptions = {
  fixedColumns?: Record<number, number>
  extraPadding?: number
  minWidth?: number // Defaults to 10
}

const defaultCellLength = 10
const getMaxStringLength = (strings: (string | null | undefined)[]) =>
  Math.max(
    ...strings
      .filter(onlyDefinedAndNotNull)
      .map((value) => value?.length ?? defaultCellLength),
  ) || defaultCellLength

// Adjust column width automatically based on content
export const autosizeColumns = (
  worksheet: Worksheet,
  options?: AutosizeColumnsOptions,
) => {
  for (const column of worksheet.columns) {
    if (
      options?.fixedColumns &&
      column.number &&
      options.fixedColumns[column.number]
    ) {
      column.width = options.fixedColumns[column.number]
      continue
    }

    let columnMaxLength = options?.minWidth ?? 10

    if (!column.eachCell) continue

    column.eachCell({ includeEmpty: false }, (cell) => {
      const cellLength = getMaxStringLength(cell.text.split('\n'))

      if (cellLength > columnMaxLength) {
        columnMaxLength = cellLength
      }
    })
    column.width = columnMaxLength + (options?.extraPadding ?? 0)
  }
}
