import { dateAsIsoDay } from '@/libraries/date'

export const nomDuFichierDesBeneficiaires = (le: Date) =>
  `coop-numerique_export-beneficiaires_${dateAsIsoDay(le)}.xlsx`
