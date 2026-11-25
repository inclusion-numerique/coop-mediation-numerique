import { dateAsIsoDay } from '@/libraries/date'

export const nomDuFichierDesUtilisateurs = (le: Date) =>
  `coop-numerique_utilisateurs_${dateAsIsoDay(le)}.xlsx`
