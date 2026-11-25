import { dateAsIsoDay } from '@/libraries/date'

export const nomDuFichierDesStatistiques = (le: Date) =>
  `coop-numerique_statistiques_${dateAsIsoDay(le)}.xlsx`
