import { prismaClient } from '@/configuration/prisma'
import {
  type ActivitesDuCoordinateur,
  TypeDActiviteDeCoordination,
} from '../../domain'

export const activitesDuCoordinateur: ActivitesDuCoordinateur = async (
  coordinateurId,
) =>
  (
    await prismaClient.activiteCoordination.findMany({
      where: { coordinateurId, suppression: null },
      select: { type: true, date: true },
    })
  ).map(({ type, date }) => ({
    type: TypeDActiviteDeCoordination(type),
    date,
  }))
