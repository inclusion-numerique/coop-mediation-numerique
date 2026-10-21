import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse'
import type { Prisma } from '@app/web/generated/prisma/client'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { getUserDisplayName } from '@app/web/utils/user'
import type { CoordinateurId } from '../../../../domain'

export type MediateurAInviter = {
  readonly mediateurId: string
  readonly nom: string
  readonly email: string
  readonly conseillerNumerique: boolean
}

export type MediateursAInviter = {
  readonly mediateurs: readonly MediateurAInviter[]
  readonly total: number
}

const motsDe = (recherche: string): readonly string[] =>
  recherche.split(/\s+/).filter((mot) => mot.length > 0)

const correspondA = (mot: string): Prisma.UserWhereInput => ({
  OR: [
    { firstName: { contains: mot, mode: 'insensitive' } },
    { lastName: { contains: mot, mode: 'insensitive' } },
    { email: { contains: mot, mode: 'insensitive' } },
  ],
})

export const rechercherDesMediateursAInviter = async ({
  coordinateurId,
  recherche,
}: {
  readonly coordinateurId: CoordinateurId
  readonly recherche: string
}): Promise<MediateursAInviter> => {
  const where = {
    coordinations: { none: { coordinateurId, suppression: null } },
    user: { deleted: null, AND: motsDe(recherche).map(correspondA) },
  } satisfies Prisma.MediateurWhereInput

  const [trouves, total] = await Promise.all([
    prismaClient.mediateur.findMany({
      where,
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            personneMain: { select: personneConseillerNumeriqueSelect },
          },
        },
      },
      orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
      take: DEFAULT_PAGE_SIZE,
    }),
    prismaClient.mediateur.count({ where }),
  ])

  return {
    mediateurs: trouves.map(({ id, user }) => ({
      mediateurId: id,
      nom: getUserDisplayName(user),
      email: user.email,
      conseillerNumerique: personneEstConseillerNumerique(user.personneMain),
    })),
    total,
  }
}
