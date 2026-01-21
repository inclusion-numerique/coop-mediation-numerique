import { AccompagnementsApiResponse } from '@app/web/app/api/ppg/AccompagnementsApiResponse'
import { departements } from '@app/web/data/collectivites-territoriales/departements'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

export const fetchAccompagnement = async (
  isConseillerNumerique: boolean,
  date?: string,
): Promise<AccompagnementsApiResponse[]> => {
  const dateCondition = date ? new Date(date) : undefined

  const results = await prismaClient.$queryRaw<
    { departement: string; count: number }[]
  >`
      SELECT
          SUBSTRING(COALESCE(str.code_insee, act.lieu_code_insee), 1, 2) as departement,
          COUNT(DISTINCT acc.id)::integer as count
      FROM activites act
               LEFT JOIN accompagnements acc ON acc.activite_id = act.id
               LEFT JOIN structures str ON str.id = act.structure_id
               LEFT JOIN mediateurs med ON act.mediateur_id = med.id
               LEFT JOIN users u ON med.user_id = u.id
      WHERE act.suppression IS NULL
        AND ${isConseillerNumerique ? Prisma.sql`u.is_conseiller_numerique = TRUE` : Prisma.sql`u.is_conseiller_numerique = FALSE`}
          ${dateCondition ? Prisma.sql`AND DATE(act.date) <= ${dateCondition}::date` : Prisma.empty}
        AND SUBSTRING(COALESCE(str.code_insee, act.lieu_code_insee), 1, 2) IS NOT NULL
      GROUP BY SUBSTRING(COALESCE(str.code_insee, act.lieu_code_insee), 1, 2)
  `

  return departements.map((dept) => ({
    departement: dept.code,
    count: results.find((r) => r.departement === dept.code)?.count ?? 0,
  }))
}
