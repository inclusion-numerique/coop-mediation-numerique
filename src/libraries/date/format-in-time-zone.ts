import { tz } from '@date-fns/tz'
import { type FormatOptions, format } from 'date-fns/format'

export const formatInTimeZone = (
  date: Date,
  fuseau: string,
  motif: string,
  options: Omit<FormatOptions, 'in'> = {},
): string => format(date, motif, { ...options, in: tz(fuseau) })
