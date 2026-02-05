import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const searchUtilisateurSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  inscriptionValidee: true,
  lastLogin: true,
  profilInscription: true,
  created: true,
  deleted: true,
  isConseillerNumerique: true,
  mediateur: {
    select: {
      id: true,
      derniereCreationActivite: true,
      derniereCreationBeneficiaire: true,
      accompagnementsCount: true,
      beneficiairesCount: true,
      _count: {
        select: {
          enActivite: true,
          beneficiaires: {
            where: { anonyme: false },
          },
          coordinations: true,
        },
      },
    },
  },
  coordinateur: {
    select: {
      id: true,
      derniereCreationActivite: true,
      _count: {
        select: {
          mediateursCoordonnes: {
            where: { suppression: null },
          },
        },
      },
    },
  },
  emplois: {
    where: { suppression: null },
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
  prismaClient.user.findMany({
    where,
    take,
    skip,
    select: searchUtilisateurSelect,
    orderBy: [...(orderBy ?? []), { lastName: 'asc' }],
  })

export type UtilisateurForList = Awaited<
  ReturnType<typeof queryUtilisateursForList>
>[number]
