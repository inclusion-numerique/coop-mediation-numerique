import { dateAsIsoDay } from '@/libraries/date'

export const nomDuFichierDeLEquipe = (le: Date) =>
  `coop-numerique_export-equipe_${dateAsIsoDay(le)}.xlsx`
