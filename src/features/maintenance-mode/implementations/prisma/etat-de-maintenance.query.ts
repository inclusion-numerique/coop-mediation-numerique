import { prismaClient } from '@/configuration/prisma'
import type { EtatDeMaintenance } from '@/features/maintenance-mode/domain'
import {
  periodeDeMaintenance,
  periodeDeMaintenanceSelect,
  periodeEnCoursWhere,
} from './periode-de-maintenance.select'

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
