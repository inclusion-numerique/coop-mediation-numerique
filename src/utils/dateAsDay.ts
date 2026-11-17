import { dateFormatter } from '@app/web/utils/formatDate'
import { formatInTimeZone } from 'date-fns-tz'

export const dateAsDay = dateFormatter('dd.MM.yyyy')

export const dateAsDayWithHourInTimezone = (date: Date, timezone: string) =>
  formatInTimeZone(date, timezone, "dd.MM.yyyy 'à' HH'h'mm")

export const dateAsDayConventional = dateFormatter('dd/MM/yyyy')

export const dateAsDayFullWordsInTimezone = (date: Date, timezone: string) =>
  formatInTimeZone(date, timezone, 'EEEE d MMMM')
