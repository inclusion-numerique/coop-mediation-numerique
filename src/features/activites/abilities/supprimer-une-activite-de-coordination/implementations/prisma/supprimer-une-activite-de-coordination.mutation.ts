import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import type {
  ActiviteDeCoordinationId,
  CoordinateurId,
  UtilisateurId,
} from '../../../../domain'
import {
  ActionNonAutorisee,
  ActiviteIntrouvable,
  type EchecDeSuppression,
} from '../../domain'

export const supprimerUneActiviteDeCoordination = async ({
  activiteId,
  coordinateurId,
  auteurId,
  maintenant = new Date(),
}: {
  activiteId: ActiviteDeCoordinationId
  coordinateurId: CoordinateurId | null
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<void, EchecDeSuppression>> => {
  const activite = await prismaClient.activiteCoordination.findUnique({
    where: { id: activiteId, suppression: null },
    select: { type: true, coordinateurId: true },
  })

  if (activite === null) return failure(ActiviteIntrouvable())
  if (activite.coordinateurId !== coordinateurId)
    return failure(ActionNonAutorisee())

  await prismaClient.$transaction([
    prismaClient.activitesCoordinationTags.deleteMany({
      where: { activiteCoordinationId: activiteId },
    }),
    prismaClient.activiteCoordination.update({
      where: { id: activiteId },
      data: { suppression: maintenant, modification: maintenant },
    }),
  ])

  addMutationLog({
    userId: auteurId,
    nom: 'SupprimerActiviteCoordination',
    data: { type: activite.type, id: activiteId },
  })

  return success(undefined)
}
