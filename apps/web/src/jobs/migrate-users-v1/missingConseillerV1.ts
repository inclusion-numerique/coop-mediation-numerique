import { prismaClient } from '@app/web/prismaClient'

/**
 * This v2 user represents the missing / deleted conseiller v1
 * It will be assigned to all the cras v1 that have no conseiller v1
 */
export const missingConseillerV1 = {
  userId: '7601e94f-526e-4ed8-8cb1-7692bc13f513',
  email: 'conseiller-v1-supprime@coop-numerique.anct.gouv.fr',
  deleted: new Date('2025-01-01'),
  mediateurId: 'ae132697-a758-4462-841c-f84b1a2d0a15',
}

export const createMissingConseillerV1 = async () => {
  const userData = {
    email: missingConseillerV1.email,
    firstName: 'Conseiller',
    lastName: 'V1 Supprimé',
    name: 'Conseiller V1 Supprimé',
    created: missingConseillerV1.deleted,
    updated: missingConseillerV1.deleted,
    deleted: missingConseillerV1.deleted,
    v1Imported: missingConseillerV1.deleted,
  }

  let user = await prismaClient.user.findUnique({
    where: {
      id: missingConseillerV1.userId,
    },
  })
  if (!user) {
    user = await prismaClient.user.create({
      data: {
        id: missingConseillerV1.userId,
        ...userData,
      },
    })
  }

  const mediateurData = {
    userId: missingConseillerV1.userId,
    creation: missingConseillerV1.deleted,
    modification: missingConseillerV1.deleted,
  }

  let mediateur = await prismaClient.mediateur.findUnique({
    where: {
      id: missingConseillerV1.mediateurId,
    },
  })
  if (!mediateur) {
    mediateur = await prismaClient.mediateur.create({
      data: {
        id: missingConseillerV1.mediateurId,
        ...mediateurData,
      },
    })
  }
  return { user, mediateur }
}
