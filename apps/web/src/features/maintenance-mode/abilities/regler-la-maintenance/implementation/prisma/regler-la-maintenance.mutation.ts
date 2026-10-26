import { consulterLaMaintenance } from '@app/web/features/maintenance-mode/abilities/consulter-la-maintenance'
import { periodeEnCoursWhere } from '@app/web/features/maintenance-mode/abilities/consulter-la-maintenance/implementation'
import type { EtatDeMaintenance } from '@app/web/features/maintenance-mode/domain'
import { prismaClient } from '@app/web/prismaClient'
import {
  type DemandeDeReglage,
  type Reglage,
  reglageDeLaMaintenance,
} from '../../domain'

const appliquer = async ({
  reglage,
  auteurId,
  maintenant,
}: {
  reglage: Reglage
  auteurId: string
  maintenant: Date
}): Promise<void> => {
  if (reglage._tag === 'Ouvrir') {
    await prismaClient.maintenance.create({
      data: {
        message: reglage.message,
        createdBy: auteurId,
        startedAt: maintenant,
      },
    })
    return
  }
  if (reglage._tag === 'ChangerLeMessage') {
    await prismaClient.maintenance.update({
      where: { id: reglage.periodeId },
      data: { message: reglage.message },
    })
    return
  }
  if (reglage._tag === 'Clore') {
    await prismaClient.maintenance.update({
      where: { id: reglage.periodeId },
      data: { endedAt: maintenant },
    })
  }
}

export const reglerLaMaintenance = async ({
  demande,
  auteurId,
  maintenant = new Date(),
}: {
  readonly demande: DemandeDeReglage
  readonly auteurId: string
  readonly maintenant?: Date
}): Promise<EtatDeMaintenance> => {
  const periodeEnCours = await prismaClient.maintenance.findFirst({
    where: periodeEnCoursWhere,
    orderBy: { startedAt: 'desc' },
    select: { id: true },
  })

  await appliquer({
    reglage: reglageDeLaMaintenance({ periodeEnCours, demande }),
    auteurId,
    maintenant,
  })

  return consulterLaMaintenance()
}
