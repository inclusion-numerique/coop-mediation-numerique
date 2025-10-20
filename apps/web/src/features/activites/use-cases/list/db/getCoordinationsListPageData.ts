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

export type ActivitesByDate = {
  date: string
  activites: {
    id: string
    type: TypeActiviteCoordination
    creation: Date
    typeAnimation: TypeAnimation | null
    typeAnimationAutre: string | null
    nomEvenement: string | null
    typeEvenement: TypeEvenement | null
    typeEvenementAutre: string | null
    naturePartenariat?: string[]
    naturePartenariatAutre: string | null
    partenaires: number
    participants: number
  }[]
}

export const getCoordinationsListPageData = async ({
  coordinateurId,
  searchParams,
}: {
  coordinateurId: string
  searchParams: CoordinationsFilters
}) => {
  const page = searchParams.page ?? DEFAULT_PAGE
  const pageSize = searchParams.lignes ?? DEFAULT_PAGE_SIZE

  const { take, skip } = takeAndSkipFromPage({ page, pageSize })

  const totalCount = await prismaClient.activiteCoordination.count({
    where: {
      coordinateurId,
      suppression: null,
    },
  })

  const activites = await prismaClient.activiteCoordination.findMany({
    where: {
      coordinateurId,
      suppression: null,
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
      creation: true,
      typeAnimation: true,
      typeAnimationAutre: true,
      nomEvenement: true,
      typeEvenement: true,
      typeEvenementAutre: true,
      naturePartenariat: true,
      naturePartenariatAutre: true,
      mediateurs: true,
      structures: true,
      autresActeurs: true,
      structuresPartenaires: true,
    },
  })

  const activitesByDate = Object.values(
    activites.reduce<Record<string, ActivitesByDate>>((acc, activite) => {
      const date = activite.date.toISOString().split('T')[0]

      const participants =
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
            { ...activite, participants, partenaires },
          ],
        },
      }
    }, {}),
  )

  return {
    searchResult: {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
    searchParams: {
      page: searchParams.page?.toString(),
      lignes: searchParams.lignes?.toString(),
    },
    activitesByDate,
  }
}
