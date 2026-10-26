import type { EtatDeMaintenance } from '@app/web/features/maintenance-mode/domain'
import { prismaClient } from '@app/web/prismaClient'
import {
  periodeDeMaintenance,
  periodeDeMaintenanceSelect,
  periodeEnCoursWhere,
} from './periode-de-maintenance'

export const consulterLaMaintenance = async (): Promise<EtatDeMaintenance> => {
  const enCours = await prismaClient.maintenance.findFirst({
    where: periodeEnCoursWhere,
    orderBy: { startedAt: 'desc' },
    select: periodeDeMaintenanceSelect,
  })

  return enCours == null
    ? { _tag: 'Inactive' }
    : { _tag: 'Active', message: periodeDeMaintenance(enCours).message }
}
