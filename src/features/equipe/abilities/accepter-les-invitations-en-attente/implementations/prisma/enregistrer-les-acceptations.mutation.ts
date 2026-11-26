import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLesAcceptations } from '../../domain/ports'

export const enregistrerLesAcceptations: EnregistrerLesAcceptations = async ({
  mediateurId,
  acceptees,
  accepteesLe,
  equipes,
}) => {
  await prismaClient.$transaction([
    ...acceptees.map(({ email, coordinateurId }) =>
      prismaClient.invitationEquipe.updateMany({
        where: {
          email: { equals: email, mode: 'insensitive' },
          coordinateurId,
          acceptee: null,
          refusee: null,
        },
        data: { acceptee: accepteesLe, mediateurId },
      }),
    ),
    prismaClient.mediateurCoordonne.createMany({
      data: equipes.map((coordinateurId) => ({ coordinateurId, mediateurId })),
      skipDuplicates: true,
    }),
  ])
}
