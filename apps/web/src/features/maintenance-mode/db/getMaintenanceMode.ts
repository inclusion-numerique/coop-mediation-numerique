import { defaultMaintenanceMessage } from '@app/web/features/maintenance-mode/domain/maintenanceMessage'
import { prismaClient } from '@app/web/prismaClient'

export type MaintenanceModeState = {
  active: boolean
  message: string
}

export type MaintenanceHistoryEntry = {
  id: string
  startedAt: Date
  endedAt: Date | null
  message: string | null
}

// La maintenance en cours est l’unique période non close (endedAt nul).
const currentMaintenance = () =>
  prismaClient.maintenance.findFirst({
    where: { endedAt: null },
    orderBy: { startedAt: 'desc' },
  })

export const getMaintenanceMode = async (): Promise<MaintenanceModeState> => {
  const current = await currentMaintenance()

  return {
    active: current != null,
    message: current?.message ?? defaultMaintenanceMessage,
  }
}

export const getMaintenanceHistory = async (
  take = 20,
): Promise<MaintenanceHistoryEntry[]> =>
  prismaClient.maintenance.findMany({
    select: { id: true, startedAt: true, endedAt: true, message: true },
    orderBy: { startedAt: 'desc' },
    take,
  })

export { currentMaintenance }
