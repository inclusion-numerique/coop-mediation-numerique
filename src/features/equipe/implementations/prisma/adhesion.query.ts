import { prismaClient } from '@/configuration/prisma'
import type { LireLesAdhesionsDeLaPaire } from '../../domain'
import { adhesionSelect, toAdhesion } from './adhesion.transfer'

export const lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire = async ({
  mediateurId,
  coordinateurId,
}) => {
  const lignes = await prismaClient.mediateurCoordonne.findMany({
    where: { mediateurId, coordinateurId },
    select: adhesionSelect,
  })

  return lignes.map(toAdhesion)
}
