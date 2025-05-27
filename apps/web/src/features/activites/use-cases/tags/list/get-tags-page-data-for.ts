import { SessionUser } from '@app/web/auth/sessionUser'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'

export type TagSearchParams = {
  lignes?: string
  page?: string
  tri?: 'alphabetique' | 'visibilite'
}

export const getTagsPageDataFor =
  (user: SessionUser) => async (searchParams: TagSearchParams) => {
    const { take, skip } = takeAndSkipFromPage({
      page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
      pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
    })

    const tags = await prismaClient.tag.findMany({
      where: {
        OR: [
          { mediateurId: user.mediateur?.id },
          { departement: getUserDepartement(user).code },
        ],
      },
      orderBy:
        searchParams?.tri === 'visibilite'
          ? [{ departement: 'asc' }, { mediateurId: 'asc' }]
          : { nom: 'asc' },
      take,
      skip,
    })

    const totalFilteredTags = await prismaClient.tag.count({
      where: {
        OR: [
          { mediateurId: user.mediateur?.id },
          { departement: getUserDepartement(user).code },
        ],
      },
    })

    return {
      tags: tags.map(({ nom, description, departement }) => ({
        nom,
        scope: departement ? 'départemental' : 'personnel',
        description: description ?? undefined,
      })),
      matchesCount: totalFilteredTags,
      totalPages: take ? Math.ceil(totalFilteredTags / take) : 1,
    }
  }
