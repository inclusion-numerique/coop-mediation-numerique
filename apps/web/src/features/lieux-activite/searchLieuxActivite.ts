import { LieuActiviteOption } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

type SearchLieuActiviteOptions = {
  mediateurId: string
  searchParams?: {
    recherche?: string
    page?: string
    lignes?: string
  }
}

export const searchLieuxActivite = async ({
  mediateurId,
  searchParams,
}: SearchLieuActiviteOptions) => {
  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  const where = {
    mediateurId,
    suppression: null,
    AND: toQueryParts(searchParams ?? {}).map((part) => ({
      OR: [{ structure: { nom: { contains: part, mode: 'insensitive' } } }],
    })),
  } satisfies Prisma.MediateurEnActiviteWhereInput

  const lieuxActivite = await prismaClient.mediateurEnActivite.findMany({
    where,
    take,
    skip,
    select: {
      id: true,
      creation: true,
      modification: true,
      structure: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          commune: true,
          codePostal: true,
          activitesCount: true,
        },
      },
    },
    orderBy: [
      { structure: { activitesCount: 'desc' } },
      { structure: { nom: 'asc' } },
    ],
  })

  return lieuxActivite.map(
    (
      { structure: { id, nom, commune, codePostal, adresse, activitesCount } },
      index,
    ) =>
      ({
        value: id,
        label: nom,
        extra: {
          nom,
          adresse: `${adresse}, ${codePostal} ${commune}`,
          activites: activitesCount,
          mostUsed: index === 0 && activitesCount > 0,
        },
      }) satisfies LieuActiviteOption,
  )
}
