import { SessionUser } from '@app/web/auth/sessionUser'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'
import { getTagScope, TagScope } from '../tagScope'

export type TagSearchParams = {
  lignes?: string
  page?: string
  tri?: 'alphabetique' | 'visibilite'
}

const availableFor = (user: SessionUser) => {
  const departement = getUserDepartement(user)
  if (!departement) return { mediateurId: user.mediateur?.id }
  return {
    OR: [
      ...(user.mediateur?.id ? [{ mediateurId: user.mediateur.id }] : []),
      ...(user.coordinateur?.id
        ? [{ coordinateurId: user.coordinateur.id }]
        : []),
      { departement: departement.code },
    ],
  }
}

const sortOptionSelectedIn = (
  searchParams: TagSearchParams,
): Prisma.TagOrderByWithRelationInput[] | Prisma.TagOrderByWithRelationInput =>
  searchParams?.tri === 'visibilite'
    ? [{ departement: 'asc' }, { mediateurId: 'asc' }]
    : { nom: 'asc' }

const paginationConfigFrom = (searchParams: TagSearchParams) => ({
  ...takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  }),
  orderBy: sortOptionSelectedIn(searchParams),
})

export const getTagsPageDataFor =
  (user: SessionUser) => async (searchParams: TagSearchParams) => {
    const { take, skip, orderBy } = paginationConfigFrom(searchParams)

    const tags = await prismaClient.tag.findMany({
      where: availableFor(user),
      take,
      skip,
      orderBy,
    })

    const totalFilteredTags = await prismaClient.tag.count({
      where: availableFor(user),
    })

    return {
      tags: tags.map((tag) => {
        const { id, nom, description } = tag
        return {
          id,
          nom,
          scope: getTagScope(tag),
          description: description ?? undefined,
        }
      }),
      matchesCount: totalFilteredTags,
      totalPages: take ? Math.ceil(totalFilteredTags / take) : 1,
    }
  }
