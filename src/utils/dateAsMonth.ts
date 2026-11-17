import { dateFormatter } from '@/utils/formatDate'

// e.g. 02/2023
export const dateAsMonth = dateFormatter('MM/yyyy')

// e.g. février 2023
export const dateAsMonthFull = dateFormatter('MMMM yyyy')
