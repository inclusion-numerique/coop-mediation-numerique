import { dateAsIsoDay } from '@/libraries/date'

export const nomDuFichierDesAccompagnements = (le: Date) =>
  `coop-numerique_accompagnements_${dateAsIsoDay(le)}.xlsx`
