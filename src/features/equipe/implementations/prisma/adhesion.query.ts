import { prismaClient } from '@/configuration/prisma'
import type { AdhesionArchivee, LireLesAdhesionsDeLaPaire } from '../../domain'
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

export const enregistrerLArchivage = async (
  adhesion: AdhesionArchivee,
): Promise<void> => {
  await prismaClient.mediateurCoordonne.update({
    where: { id: adhesion.id },
    data: {
      suppression: adhesion.archiveeLe,
      modification: adhesion.archiveeLe,
    },
  })
}
