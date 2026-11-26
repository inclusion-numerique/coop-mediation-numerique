import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerStatutRdv } from '../../domain/ports'

export const enregistrerStatutRdv: EnregistrerStatutRdv = async ({
  rdvId,
  statut,
}) => {
  await prismaClient.rdv.update({
    where: { id: rdvId },
    data: {
      status: statut.statutPresence,
      compteRenduRegle: statut.compteRenduRegle,
    },
  })
}
