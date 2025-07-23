import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

type SearchLieuActiviteOptions = {
  mediateurId?: string
  excludeIds?: string[]
  searchParams?: {
    recherche?: string
    page?: string
    lignes?: string
  }
}

export const searchTags = async ({
  mediateurId,
  excludeIds = [],
  searchParams,
}: SearchLieuActiviteOptions) => {
  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })
  const recherche = searchParams?.recherche?.trim() ?? ''

  const mediateur = await prismaClient.mediateur.findUnique({
    where: { id: mediateurId },
    select: { user: { select: { emplois: { select: { structure: true } } } } },
  })

  const departement = mediateur?.user
    ? getUserDepartement(mediateur.user)
    : null

  const tags = await prismaClient.$queryRaw<
    { id: string; nom: string; description: string | null }[]
  >`
      SELECT
        t.id,
        t.nom,
        t.description,
        COUNT(a.id) AS usage_count
      FROM tags t
        LEFT JOIN activite_tags at ON at.tag_id = t.id
        LEFT JOIN activites a ON a.id = at.activite_id
        AND a.mediateur_id = ${mediateurId}::UUID
        AND a.suppression IS NULL
      WHERE
        t.suppression IS NULL
        ${
          excludeIds.length === 0
            ? Prisma.empty
            : Prisma.sql`AND t.id NOT IN (${Prisma.join(excludeIds.map((id) => Prisma.sql`${id}::UUID`))})`
        }
        AND t.nom ILIKE ${`%${recherche}%`}
        AND (
        t.mediateur_id = ${mediateurId}::UUID
        ${departement == null ? Prisma.empty : Prisma.sql`OR t.departement = ${departement.code}::text`}
         OR (t.mediateur_id IS NULL AND t.departement IS NULL)
        )
      GROUP BY t.id
      ORDER BY usage_count DESC
      LIMIT ${take}
      OFFSET ${skip}
    `

  return {
    items: tags.map(({ id, nom, description }) => ({
      id,
      nom,
      description: description ?? undefined,
    })),
  }
}
