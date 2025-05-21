import {
  Day,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

type DateFunction<T = undefined> = (date: Date, options?: T) => Date

const transformZonedDate = <D extends Date, T = undefined>(
  date: D,
  dateFunction: DateFunction<T>,
  options?: T,
): Date => {
  // Get the timezone from the input date
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Apply the date function in the input timezone
  const result = dateFunction(date, options)

  // Format with the input timezone
  return new Date(
    formatInTimeZone(result, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
  )
}

// Day period functions
export const getStartOfDay = (date: Date): Date => {
  return transformZonedDate(date, startOfDay as DateFunction)
}

export const getOptionalStartOfDay = (date: Date | null): Date | null => {
  return date ? getStartOfDay(date) : null
}

export const getEndOfDay = (date: Date): Date => {
  return transformZonedDate(date, endOfDay as DateFunction)
}

export const getOptionalEndOfDay = (date: Date | null): Date | null => {
  return date ? getEndOfDay(date) : null
}

// Week period functions
export const getStartOfWeek = (date: Date): Date => {
  return transformZonedDate(
    date,
    startOfWeek as DateFunction<{ weekStartsOn: Day }>,
    { weekStartsOn: 1 },
  )
}

export const getOptionalStartOfWeek = (date: Date | null): Date | null => {
  return date ? getStartOfWeek(date) : null
}

export const getEndOfWeek = (date: Date): Date => {
  return transformZonedDate(
    date,
    endOfWeek as DateFunction<{ weekStartsOn: Day }>,
    { weekStartsOn: 1 },
  )
}

export const getOptionalEndOfWeek = (date: Date | null): Date | null => {
  return date ? getEndOfWeek(date) : null
}

// Month period functions
export const getStartOfMonth = (date: Date): Date => {
  return transformZonedDate(date, startOfMonth as DateFunction)
}

export const getOptionalStartOfMonth = (date: Date | null): Date | null => {
  return date ? getStartOfMonth(date) : null
}

export const getEndOfMonth = (date: Date): Date => {
  return transformZonedDate(date, endOfMonth as DateFunction)
}

export const getOptionalEndOfMonth = (date: Date | null): Date | null => {
  return date ? getEndOfMonth(date) : null
}

// Year period functions
export const getStartOfYear = (date: Date): Date => {
  return transformZonedDate(date, startOfYear as DateFunction)
}

export const getOptionalStartOfYear = (date: Date | null): Date | null => {
  return date ? getStartOfYear(date) : null
}

export const getEndOfYear = (date: Date): Date => {
  return transformZonedDate(date, endOfYear as DateFunction)
}

export const getOptionalEndOfYear = (date: Date | null): Date | null => {
  return date ? getEndOfYear(date) : null
}
