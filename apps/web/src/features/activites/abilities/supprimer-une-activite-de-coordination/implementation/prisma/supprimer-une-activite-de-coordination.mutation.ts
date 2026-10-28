import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import type {
  ActiviteDeCoordinationId,
  CoordinateurId,
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
  auteurId: string
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
    duration: 0,
    data: { type: activite.type, id: activiteId },
  })

  return success(undefined)
}
