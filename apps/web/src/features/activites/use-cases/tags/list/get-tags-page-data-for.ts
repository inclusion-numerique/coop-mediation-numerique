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
import { TagScope } from '../tagScope'

export type TagSearchParams = {
  lignes?: string
  page?: string
  tri?: 'alphabetique' | 'visibilite'
}

const availableFor = (user: SessionUser) => ({
  OR: [
    { mediateurId: user.mediateur?.id },
    { departement: getUserDepartement(user).code },
  ],
})

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
      tags: tags.map(({ id, nom, description, departement }) => ({
        id,
        nom,
        scope: departement ? TagScope.Departemental : TagScope.Personnel,
        description: description ?? undefined,
      })),
      matchesCount: totalFilteredTags,
      totalPages: take ? Math.ceil(totalFilteredTags / take) : 1,
    }
  }
