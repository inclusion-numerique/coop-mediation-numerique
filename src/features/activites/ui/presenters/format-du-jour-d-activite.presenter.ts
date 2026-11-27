import { dateFormatter } from '@/libraries/date'

const activiteDayDateFormatter = dateFormatter('EEE d MMMM yyyy')

export const formatActiviteDayDate = (date: Date | string) =>
  activiteDayDateFormatter(typeof date === 'string' ? new Date(date) : date)
