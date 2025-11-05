import { CoordinateurUser } from '@app/web/auth/userTypeGuards'
import { prismaClient } from '@app/web/prismaClient'
import { CoordinationsFilters } from '../validation/CoordinationsFilters'

const select = {
  id: true,
  type: true,
  date: true,
  duree: true,
  creation: true,
  modification: true,
  typeAnimation: true,
  typeAnimationAutre: true,
  thematiquesAnimation: true,
  thematiqueAnimationAutre: true,
  organisateurs: true,
  organisateurAutre: true,
  initiative: true,
  nom: true,
  typeEvenement: true,
  typeEvenementAutre: true,
  naturePartenariat: true,
  naturePartenariatAutre: true,
  mediateurs: true,
  structures: true,
  autresActeurs: true,
  structuresPartenaires: true,
  participants: true,
  echelonTerritorial: true,
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          nom: true,
        },
      },
    },
  },
  notes: true,
}

const getActivitesCoordination = async ({
  user,
  searchParams,
}: {
  user: CoordinateurUser
  searchParams: CoordinationsFilters
}) => {
  const activites = await prismaClient.activiteCoordination.findMany({
    where: {
      coordinateurId: user.coordinateur.id,
      suppression: null,
      ...((searchParams.types?.length ?? 0) > 0
        ? { type: { in: searchParams.types } }
        : {}),
      ...(searchParams.du && searchParams.au
        ? {
            date: {
              gte: new Date(searchParams.du),
              lte: new Date(searchParams.au),
            },
          }
        : {}),
    },
    orderBy: { date: 'desc' },
    select,
  })

  return activites.map((a) => ({
    ...a,
    structuresPartenaires: (Array.isArray(a.structuresPartenaires)
      ? a.structuresPartenaires
      : []) as { nom: string; type: string }[],
  }))
}

export type ActiviteCoordinationListItem = Awaited<
  ReturnType<typeof getActivitesCoordination>
>[number]

export const getActivitesCoordinationWorksheetInput = async ({
  user,
  searchParams,
}: {
  user: CoordinateurUser
  searchParams: CoordinationsFilters
}) => ({
  user,
  activites: await getActivitesCoordination({ user, searchParams }),
})
