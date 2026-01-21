import { departements } from '@app/web/data/collectivites-territoriales/departements'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

export type AccompagnementsByDepartment = {
  count: number
  departement: {
    nom: string
    code: string
  }
}

export const getAccompagnementsByDepartment = async ({
  isConseillerNumerique,
  until,
}: {
  isConseillerNumerique: boolean
  until?: Date
}): Promise<AccompagnementsByDepartment[]> => {
  /**
   * ^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])
   * ├── 97x ou 98x  → DOM-TOM (3 chiffres)
   * ├── 2A / 2B     → corse
   * └── 00 - 95     → métropole
   */
  const results = await prismaClient.$queryRaw<
    { departement: string; count: number }[]
  >`
      SELECT
          SUBSTRING(
                  COALESCE(str.code_insee, act.lieu_code_insee)
                  FROM '^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'
          ) AS departement,
          COUNT(DISTINCT acc.id)::integer as count
      FROM activites act
               LEFT JOIN accompagnements acc ON acc.activite_id = act.id
               LEFT JOIN structures str ON str.id = act.structure_id
               LEFT JOIN mediateurs med ON act.mediateur_id = med.id
               LEFT JOIN users u ON med.user_id = u.id
      WHERE act.suppression IS NULL
        AND ${
          isConseillerNumerique
            ? Prisma.sql`u.is_conseiller_numerique = TRUE`
            : Prisma.sql`u.is_conseiller_numerique = FALSE`
        }
          ${
            until
              ? Prisma.sql`AND DATE(act.date) <= ${until}::date`
              : Prisma.empty
          }
        AND SUBSTRING(
              COALESCE(str.code_insee, act.lieu_code_insee)
              FROM '^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'
            ) IS NOT NULL
      GROUP BY SUBSTRING(
                       COALESCE(str.code_insee, act.lieu_code_insee)
                       FROM '^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'
               )
  `

  return departements.map((departement) => ({
    departement,
    count: results.find((r) => r.departement === departement.code)?.count ?? 0,
  }))
}
