import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { PeriodeDeMaintenance } from '@/features/maintenance-mode/domain'
import {
  periodeDeMaintenance,
  periodeDeMaintenanceSelect,
} from '../../../../implementations/prisma/periode-de-maintenance.select'

const TAILLE_DE_L_HISTORIQUE = 20

export const consulterLHistoriqueDesMaintenances = async (): Promise<
  readonly PeriodeDeMaintenance[]
> => {
  const periodes = await prismaClient.maintenance.findMany({
    select: periodeDeMaintenanceSelect,
    orderBy: { startedAt: 'desc' },
    take: TAILLE_DE_L_HISTORIQUE,
  })

  return periodes.map(periodeDeMaintenance)
}
