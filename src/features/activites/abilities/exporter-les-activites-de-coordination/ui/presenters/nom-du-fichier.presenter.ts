import { dateAsIsoDay } from '@/libraries/date'

export const nomDuFichierDesCoordinations = (le: Date) =>
  `coop-numerique_coordinations_${dateAsIsoDay(le)}.xlsx`
