import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { EnregistrerLAdhesion } from '../../domain/ports'

export const enregistrerLAdhesion: EnregistrerLAdhesion = async ({
  mediateurId,
  coordinateurId,
  email,
  auteurId,
}) => {
  await prismaClient.$transaction([
    prismaClient.mediateurCoordonne.create({
      data: { mediateurId, coordinateurId },
    }),
    prismaClient.invitationEquipe.deleteMany({
      where: {
        coordinateurId,
        acceptee: null,
        refusee: null,
        OR: [
          { mediateurId },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    }),
  ])

  addMutationLog({
    userId: auteurId,
    nom: 'CreerMediateurCoordonne',
    data: { mediateurId, coordinateurId },
  })
}
