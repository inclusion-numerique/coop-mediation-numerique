import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { addRdvBadgeStatus } from './addRdvBadgeStatus'

export const rdvListSelect = {
  id: true,
  durationInMin: true,
  status: true,
  startsAt: true,
  endsAt: true,
  name: true,
  maxParticipantsCount: true,
  organisationId: true,
  urlForAgents: true,
  motif: {
    select: {
      name: true,
      collectif: true,
    },
  },
  participations: {
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          beneficiaires: {
            select: {
              id: true,
              prenom: true,
              nom: true,
            },
            where: {
              anonyme: false,
              suppression: null,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.RdvSelect

export const getRdvsByIds = async ({ ids }: { ids: number[] }) => {
  return prismaClient.rdv
    .findMany({
      where: { id: { in: ids } },
      select: rdvListSelect,
    })
    .then((rdvs) => rdvs.map(addRdvBadgeStatus))
}

export type RdvListItem = Awaited<ReturnType<typeof getRdvsByIds>>[number]
