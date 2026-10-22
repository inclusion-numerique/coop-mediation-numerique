import { conseillerNumeriqueWhere } from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import type { CriteresDExposition } from '../../domain'

const filtresDeSuppression = {
  Exclus: { equals: null },
  Seuls: { not: null },
  Inclus: undefined,
}

const suppressionSelon = (
  selection: keyof typeof filtresDeSuppression,
): Prisma.DateTimeNullableFilter | undefined => filtresDeSuppression[selection]

const conseillersSelon = (
  selection: CriteresDExposition['conseillersNumeriques'],
): Prisma.UserWhereInput =>
  selection === 'Indifferent'
    ? {}
    : conseillerNumeriqueWhere(selection === 'Seuls')

const exposeWhere = (criteres: CriteresDExposition): Prisma.UserWhereInput => ({
  role: 'User',
  OR: [
    { inscriptionValidee: { not: null } },
    { mediateur: { is: { activites: { some: {} } } } },
  ],
  ...(suppressionSelon(criteres.supprimes) === undefined
    ? {}
    : { deleted: suppressionSelon(criteres.supprimes) }),
  ...conseillersSelon(criteres.conseillersNumeriques),
  AND: [
    ...(criteres.identifiantsConseillerNumerique.length === 0
      ? []
      : [
          {
            personneMain: {
              is: {
                cnPgId: { in: [...criteres.identifiantsConseillerNumerique] },
              },
            },
          },
        ]),
    ...(criteres.identifiantsDataspace.length === 0
      ? []
      : [
          {
            personneMain: {
              is: { id: { in: [...criteres.identifiantsDataspace] } },
            },
          },
        ]),
  ],
})

const exposeSelect = (criteres: CriteresDExposition) => {
  const suppression = suppressionSelon(criteres.supprimes)
  const lienWhere = suppression === undefined ? {} : { suppression }

  return {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    inscriptionValidee: true,
    created: true,
    updated: true,
    deleted: true,
    personneMain: {
      select: {
        id: true,
        cnPgId: true,
        affectationsEmploi: {
          where: { estActive: true },
          select: {
            id: true,
            source: true,
            estActive: true,
            structureAdministrativeId: true,
            createdAt: true,
          },
        },
        contrats: {
          select: {
            structureId: true,
            dateDebut: true,
            dateFin: true,
            dateRupture: true,
          },
        },
      },
    },
    mediateur: {
      select: {
        id: true,
        creation: true,
        modification: true,
        isVisible: true,
        enActivite: { where: lienWhere },
        coordinations: {
          where: lienWhere,
          include: { mediateur: { select: { userId: true } } },
        },
      },
    },
    coordinateur: {
      select: {
        id: true,
        creation: true,
        modification: true,
        mediateursCoordonnes: {
          where: lienWhere,
          include: { mediateur: { select: { userId: true } } },
        },
      },
    },
  } satisfies Prisma.UserSelect
}

export type UtilisateurExpose = Prisma.UserGetPayload<{
  select: ReturnType<typeof exposeSelect>
}>

export const utilisateursExposes = async ({
  criteres,
  take,
  skip,
  cursor,
}: {
  readonly criteres: CriteresDExposition
  readonly take: number
  readonly skip: number | undefined
  readonly cursor: { readonly created: string; readonly id: string } | null
}): Promise<{
  readonly utilisateurs: readonly UtilisateurExpose[]
  readonly total: number
}> => {
  const where = exposeWhere(criteres)

  const [utilisateurs, total] = await Promise.all([
    prismaClient.user.findMany({
      where,
      orderBy: [{ created: 'desc' }, { id: 'desc' }],
      take,
      skip,
      cursor:
        cursor === null
          ? undefined
          : { created_id: { created: cursor.created, id: cursor.id } },
      select: exposeSelect(criteres),
    }),
    prismaClient.user.count({ where }),
  ])

  return { utilisateurs, total }
}
