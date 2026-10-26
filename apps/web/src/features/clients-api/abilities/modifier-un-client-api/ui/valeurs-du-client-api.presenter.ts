import type { ClientApi } from '@app/web/features/clients-api/domain'
import type { ValeursDuClientApi } from '@app/web/features/clients-api/formulaire'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'

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
