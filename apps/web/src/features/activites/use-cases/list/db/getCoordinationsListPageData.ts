import { CoordinateurUser } from '@app/web/auth/userTypeGuards'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import {
  TypeActiviteCoordination,
  TypeAnimation,
  TypeEvenement,
} from '@prisma/client'
import { CoordinationsFilters } from '../validation/CoordinationsFilters'

type TypeStructurePartenaires = {
  nom: string
  type: string
}[]

export type ActivitesByDate = {
  date: string
  activites: {
    id: string
    type: TypeActiviteCoordination
    creation: Date
    modification: Date
    typeAnimation: TypeAnimation | null
    typeAnimationAutre: string | null
    thematiquesAnimation: string[] | null
    thematiqueAnimationAutre: string | null
    organisateurs: string[] | null
    organisateurAutre: string | null
    initiative: string | null
    nom: string | null
    typeEvenement: TypeEvenement | null
    typeEvenementAutre: string | null
    naturePartenariat?: string[]
    naturePartenariatAutre: string | null
    structuresPartenaires: TypeStructurePartenaires | null
    partenaires: number | null
    participants: number | null
    mediateurs: number | null
    structures: number | null
    autresActeurs: number | null
    echelonTerritorial: string | null
    duree: number | null
    tags: { id: string; nom: string }[]
    notes: string | null
  }[]
}

export const getCoordinationsListPageData = async ({
  user,
  searchParams,
}: {
  user: CoordinateurUser
  searchParams: CoordinationsFilters
}) => {
  const page = searchParams.page ?? DEFAULT_PAGE
  const pageSize = searchParams.lignes ?? DEFAULT_PAGE_SIZE

  const { take, skip } = takeAndSkipFromPage({ page, pageSize })

  const hasTypesFilter = (searchParams.types?.length ?? 0) > 0

  const totalCount = await prismaClient.activiteCoordination.count({
    where: {
      coordinateurId: user.coordinateur.id,
      suppression: null,
      ...(hasTypesFilter ? { type: { in: searchParams.types } } : {}),
      ...(searchParams.du && searchParams.au
        ? {
            date: {
              gte: new Date(searchParams.du),
              lte: new Date(searchParams.au),
            },
          }
        : {}),
    },
  })

  const activites = await prismaClient.activiteCoordination.findMany({
    where: {
      coordinateurId: user.coordinateur.id,
      suppression: null,
      ...(hasTypesFilter ? { type: { in: searchParams.types } } : {}),
      ...(searchParams.du && searchParams.au
        ? {
            date: {
              gte: new Date(searchParams.du),
              lte: new Date(searchParams.au),
            },
          }
        : {}),
    },
    orderBy: {
      date: 'desc',
    },
    take,
    skip,
    select: {
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
    },
  })

  const activitesByDate = Object.values(
    activites.reduce<Record<string, ActivitesByDate>>((acc, activite) => {
      const date = activite.date.toISOString().split('T')[0]

      const participants =
        activite.participants ??
        (activite.mediateurs ?? 0) +
          (activite.structures ?? 0) +
          (activite.autresActeurs ?? 0)

      const partenaires = Array.isArray(activite.structuresPartenaires)
        ? activite.structuresPartenaires.length
        : 0

      return {
        ...acc,
        [date]: {
          date,
          activites: [
            ...(acc[date]?.activites ?? []),
            {
              ...activite,
              participants,
              partenaires,
              tags: activite.tags.map((t) => t.tag),
              structuresPartenaires:
                activite.structuresPartenaires as TypeStructurePartenaires,
            },
          ],
        },
      }
    }, {}),
  )

  return {
    searchResult: {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      isFiltered:
        hasTypesFilter || (searchParams.du != null && searchParams.au != null),
    },
    searchParams: {
      page: searchParams.page?.toString(),
      lignes: searchParams.lignes?.toString(),
    },
    activitesByDate,
    timezone: user.timezone,
  }
}
