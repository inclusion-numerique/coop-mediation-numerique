import type { ValeursDuClientApi } from '@/features/clients-api/action/client-api.validation'
import type { ClientApi } from '@/features/clients-api/domain'
import { dateAsIsoDay } from '@/libraries/date'

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
