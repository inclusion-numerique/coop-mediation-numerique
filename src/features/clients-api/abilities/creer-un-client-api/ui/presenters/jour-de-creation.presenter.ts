import { dateAsIsoDay } from '@/libraries/date'

export const jourDeCreation = (maintenant: Date) => dateAsIsoDay(maintenant)
