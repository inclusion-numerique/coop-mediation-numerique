import { prismaClient } from '@/configuration/prisma'
import type {
  ChangerLeMessage,
  CloreLaPeriode,
  OuvrirUnePeriode,
} from '../../domain/ports'

export const ouvrirUnePeriode: OuvrirUnePeriode = async ({
  message,
  auteurId,
  debut,
}) => {
  await prismaClient.maintenance.create({
    data: { message, createdBy: auteurId, startedAt: debut },
  })
}

export const changerLeMessage: ChangerLeMessage = async ({
  periodeId,
  message,
}) => {
  await prismaClient.maintenance.update({
    where: { id: periodeId },
    data: { message },
  })
}

export const cloreLaPeriode: CloreLaPeriode = async ({ periodeId, fin }) => {
  await prismaClient.maintenance.update({
    where: { id: periodeId },
    data: { endedAt: fin },
  })
}
