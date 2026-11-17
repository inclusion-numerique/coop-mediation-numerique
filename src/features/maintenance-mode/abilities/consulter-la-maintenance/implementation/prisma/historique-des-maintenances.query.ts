import type { PeriodeDeMaintenance } from '@app/web/features/maintenance-mode/domain'
import { prismaClient } from '@app/web/prismaClient'
import {
  periodeDeMaintenance,
  periodeDeMaintenanceSelect,
} from './periode-de-maintenance'

export const TAILLE_DE_L_HISTORIQUE = 20

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
