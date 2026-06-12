import {
  currentMaintenance,
  getMaintenanceMode,
  type MaintenanceModeState,
} from '@app/web/features/maintenance-mode/db/getMaintenanceMode'
import { prismaClient } from '@app/web/prismaClient'

// Activer ouvre une nouvelle période (ou met à jour le message de la période en cours).
// Désactiver clôt la période en cours en renseignant `endedAt`, ce qui l’archive.
export const setMaintenanceMode = async ({
  active,
  message,
  updatedBy,
}: {
  active: boolean
  message: string | null
  updatedBy: string
}): Promise<MaintenanceModeState> => {
  const current = await currentMaintenance()

  if (!active) {
    if (current) {
      await prismaClient.maintenance.update({
        where: { id: current.id },
        data: { endedAt: new Date() },
      })
    }
    return getMaintenanceMode()
  }

  if (current) {
    await prismaClient.maintenance.update({
      where: { id: current.id },
      data: { message },
    })
    return getMaintenanceMode()
  }

  await prismaClient.maintenance.create({
    data: { message, createdBy: updatedBy },
  })
  return getMaintenanceMode()
}
