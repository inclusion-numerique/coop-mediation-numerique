import type { Prisma } from '@app/web/generated/prisma/client'
import { type Production, rattachements } from '../domain'

export const productionSelect = {
  mediateur: {
    select: {
      id: true,
      _count: {
        select: {
          activites: { where: { suppression: null } },
          beneficiaires: { where: { suppression: null } },
        },
      },
    },
  },
  coordinateur: {
    select: {
      id: true,
      _count: {
        select: {
          mediateursCoordonnes: { where: { suppression: null } },
          ActiviteCoordination: { where: { suppression: null } },
          invitations: { where: { acceptee: null, refusee: null } },
        },
      },
    },
  },
} satisfies Prisma.UserSelect

export type ProductionRow = Prisma.UserGetPayload<{
  select: typeof productionSelect
}>

export const productionToDomain = ({
  mediateur,
  coordinateur,
}: ProductionRow): Production =>
  rattachements(
    mediateur === null
      ? null
      : {
          activites: mediateur._count.activites > 0,
          beneficiaires: mediateur._count.beneficiaires > 0,
        },
    coordinateur === null
      ? null
      : {
          equipe: coordinateur._count.mediateursCoordonnes > 0,
          activitesCoordination: coordinateur._count.ActiviteCoordination > 0,
          invitationsEnAttente: coordinateur._count.invitations > 0,
        },
  )
