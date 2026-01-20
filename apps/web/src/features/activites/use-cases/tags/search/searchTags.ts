import { getSessionUser } from '@app/web/auth/getSessionUser'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'
import { getTagScope } from '../tagScope'

type SearchLieuActiviteOptions = {
  excludeIds?: string[]
  searchParams?: {
    recherche?: string
    page?: string
    lignes?: string
  }
}

export const searchTags = async ({
  excludeIds = [],
  searchParams,
}: SearchLieuActiviteOptions) => {
  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })
  const recherche = searchParams?.recherche?.trim() ?? ''

  const user = await getSessionUser()

  const departement = user ? getUserDepartement(user) : null

  const tags = await prismaClient.$queryRaw<
    {
      id: string
      nom: string
      description: string | null
      mediateurId: string | null
      coordinateurId: string | null
      departement: string | null
      equipe: boolean | null
    }[]
  >`
      SELECT
        t.id,
        t.nom,
        t.description,
        t.mediateur_id as "mediateurId",
        t.coordinateur_id as "coordinateurId",
        t.departement,
        t.equipe,
        COUNT(DISTINCT COALESCE(a.id, ac.id)) AS usage_count
      FROM tags t
        LEFT JOIN activite_tags at ON at.tag_id = t.id
        LEFT JOIN activites a ON a.id = at.activite_id
        AND a.mediateur_id = ${user?.mediateur?.id ?? null}::UUID
        AND a.suppression IS NULL
        LEFT JOIN activite_coordination_tags act ON act.tag_id = t.id
        LEFT JOIN activite_coordination ac ON ac.id = act.activite_coordination_id
        AND ac.coordinateur_id = ${user?.coordinateur?.id ?? null}::UUID
        AND ac.suppression IS NULL
      WHERE
        t.suppression IS NULL
        ${
          excludeIds.length === 0
            ? Prisma.empty
            : Prisma.sql`AND t.id NOT IN (${Prisma.join(excludeIds.map((id) => Prisma.sql`${id}::UUID`))})`
        }
        AND t.nom ILIKE ${`%${recherche}%`}
        AND (
        (t.mediateur_id = ${user?.mediateur?.id ?? null}::UUID OR t.coordinateur_id = ${user?.coordinateur?.id ?? null}::UUID)
        ${departement == null ? Prisma.empty : Prisma.sql`OR t.departement = ${departement.code}::text`}
         OR (t.mediateur_id IS NULL AND t.coordinateur_id IS NULL AND t.departement IS NULL)
        )
      GROUP BY t.id
      ORDER BY usage_count DESC, t.nom ASC
      LIMIT ${take}
      OFFSET ${skip}
    `

  return {
    items: tags.map(
      ({
        id,
        nom,
        description,
        mediateurId,
        coordinateurId,
        departement,
        equipe,
      }) => ({
        id,
        nom,
        description: description ?? undefined,
        scope: getTagScope({
          mediateurId,
          coordinateurId,
          departement,
          equipe,
        }),
      }),
    ),
  }
}
