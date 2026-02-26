import { Invitation } from '@app/web/equipe/InvitationValidation'
import { prismaClient } from '@app/web/prismaClient'

export const getInvitationData = (invitation: Invitation) =>
  prismaClient.invitationEquipe.findFirst({
    where: {
      email: { equals: invitation.email, mode: 'insensitive' },
      coordinateurId: invitation.coordinateurId,
      acceptee: null,
      refusee: null,
    },
    select: {
      coordinateur: {
        select: {
          user: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              mediateursCoordonnes: {
                where: {
                  suppression: null,
                },
              },
            },
          },
        },
      },
    },
  })
