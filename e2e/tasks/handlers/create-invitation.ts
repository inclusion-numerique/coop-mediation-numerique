import { prismaClient } from '@/configuration/prisma'

export const createInvitation = async ({
  email,
  mediateurId,
  coordinateurId,
}: {
  email: string
  mediateurId?: string
  coordinateurId: string
}) =>
  prismaClient.invitationEquipe.create({
    data: {
      email,
      ...(mediateurId === undefined ? {} : { mediateurId }),
      coordinateurId,
    },
  })
