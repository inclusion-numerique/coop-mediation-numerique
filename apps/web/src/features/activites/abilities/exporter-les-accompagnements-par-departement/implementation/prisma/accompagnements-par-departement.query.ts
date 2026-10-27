import { departements } from '@app/web/data/collectivites-territoriales/departements'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'

export type AccompagnementsDuDepartement = {
  readonly departement: { readonly nom: string; readonly code: string }
  readonly accompagnements: number
}

const codeDepartementSql = Prisma.sql`SUBSTRING(
  COALESCE(str.code_insee, act.lieu_code_insee)
  FROM '^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'
)`

export const accompagnementsParDepartement = async ({
  conseillersNumeriques,
  jusquAu,
}: {
  readonly conseillersNumeriques: boolean
  readonly jusquAu: Date | undefined
}): Promise<readonly AccompagnementsDuDepartement[]> => {
  const comptes = await prismaClient.$queryRaw<
    { departement: string; count: number }[]
  >`
      SELECT
          ${codeDepartementSql} AS departement,
          COUNT(DISTINCT acc.id)::integer as count
      FROM activites act
               LEFT JOIN accompagnements acc ON acc.activite_id = act.id
               LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
               LEFT JOIN mediateurs med ON act.mediateur_id = med.id
               LEFT JOIN users u ON med.user_id = u.id
      WHERE act.suppression IS NULL
        AND ${conseillerNumeriqueSql('u.id', conseillersNumeriques)}
          ${jusquAu ? Prisma.sql`AND DATE(act.date) <= ${jusquAu}::date` : Prisma.empty}
        AND ${codeDepartementSql} IS NOT NULL
      GROUP BY ${codeDepartementSql}
  `

  return departements.map((departement) => ({
    departement,
    accompagnements:
      comptes.find((compte) => compte.departement === departement.code)
        ?.count ?? 0,
  }))
}
