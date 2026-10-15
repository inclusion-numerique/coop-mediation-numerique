import { prismaClient } from '@app/web/prismaClient'
import type {
  Adhesion,
  AdhesionArchivee,
  CoordinateurId,
  MediateurId,
} from '../domain'
import { adhesionSelect, toAdhesion } from './adhesion.transfer'

export const lireLesAdhesionsDeLaPaire = async ({
  mediateurId,
  coordinateurId,
}: {
  mediateurId: MediateurId
  coordinateurId: CoordinateurId
}): Promise<readonly Adhesion[]> => {
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
