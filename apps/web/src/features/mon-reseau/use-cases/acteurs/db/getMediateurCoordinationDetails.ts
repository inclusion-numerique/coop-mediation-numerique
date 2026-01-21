import { prismaClient } from '@app/web/prismaClient'

export const getMediateurCoordinationDetails = async ({
  mediateurId,
  coordinateurId,
}: {
  mediateurId: string // the target of the coordination details
  coordinateurId: string // the coordinator viewing the details
}) => {
  const [coordinations, invitation] = await Promise.all([
    prismaClient.mediateurCoordonne.findMany({
      where: { mediateurId, coordinateurId },
      orderBy: [{ suppression: 'desc' }, { creation: 'desc' }],
    }),
    prismaClient.invitationEquipe.findFirst({
      where: { mediateurId, coordinateurId },
      orderBy: { creation: 'desc' },
    }),
  ])

  const currentCoordination = coordinations.find(
    (coordination) => coordination.suppression == null,
  )

  const coordinationsHistory = coordinations.filter(
    (coordination) => coordination.id !== currentCoordination?.id,
  )

  const coordinationEnded =
    !currentCoordination && coordinationsHistory.length > 0
      ? coordinationsHistory.find(
          (coordination) => coordination.suppression != null,
        )
      : null

  return {
    coordinations: {
      current: currentCoordination ?? null,
      coordinationEnded,
      history: coordinationsHistory,
    },
    invitation,
  }
}

export type MediateurCoordinationDetails = NonNullable<
  Awaited<ReturnType<typeof getMediateurCoordinationDetails>>
>
