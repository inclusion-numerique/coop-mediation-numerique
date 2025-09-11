import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const searchUtilisateurSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  inscriptionValidee: true,
  profilInscription: true,
  created: true,
  deleted: true,
  mediateur: {
    select: {
      id: true,
      conseillerNumerique: {
        select: { id: true },
      },
      activitesCount: true,
      accompagnementsCount: true,
      beneficiairesCount: true,
      _count: {
        select: {
          enActivite: true,
          coordinations: true,
        },
      },
    },
  },
  coordinateur: {
    select: {
      conseillerNumeriqueId: true,
    },
  },
  emplois: {
    orderBy: { creation: 'desc' },
    take: 1,
    select: {
      structure: {
        select: {
          nom: true,
          codeInsee: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect

export const queryUtilisateursForList = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.UserWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.UserOrderByWithRelationInput[]
}) =>
  prismaClient.user
    .findMany({
      where,
      take,
      skip,
      select: searchUtilisateurSelect,
      orderBy: [
        ...(orderBy ?? []),
        {
          lastName: 'asc',
        },
      ],
    })
    .then((utilisateurs) =>
      utilisateurs.map(
        (user) =>
          // TODO transform for easier use ?
          user,
      ),
    )

export type UtilisateurForList = Awaited<
  ReturnType<typeof queryUtilisateursForList>
>[number]
