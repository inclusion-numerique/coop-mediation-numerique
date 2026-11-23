import type { ClientApi } from '@/features/clients-api/domain'
import type { ValeursDuClientApi } from '@/features/clients-api/formulaire'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const valeursDuClientApi = ({
  nom,
  portees,
  validite,
}: ClientApi): ValeursDuClientApi => ({
  nom,
  debut: dateAsIsoDay(validite.debut),
  fin: validite.fin == null ? '' : dateAsIsoDay(validite.fin),
  portees: [...portees],
})
