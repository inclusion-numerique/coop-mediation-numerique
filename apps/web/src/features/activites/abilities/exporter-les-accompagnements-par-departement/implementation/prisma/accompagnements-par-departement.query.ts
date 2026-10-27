import { departements } from '@app/web/data/collectivites-territoriales/departements'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { Prisma } from '@app/web/generated/prisma/client'
import { CodeDepartement, NomDepartement } from '@app/web/libraries/departement'
import { prismaClient } from '@app/web/prismaClient'
import {
  type AccompagnementsDuDepartement,
  type Jour,
  NombreDAccompagnements,
  type PopulationDeMediateurs,
} from '../../domain'

const codeDepartementSql = Prisma.sql`SUBSTRING(
  COALESCE(str.code_insee, act.lieu_code_insee)
  FROM '^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'
)`

export const accompagnementsParDepartement = async ({
  population,
  jusquAu,
}: {
  readonly population: PopulationDeMediateurs
  readonly jusquAu: Jour | null
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
        AND ${conseillerNumeriqueSql('u.id', population === 'ConseillersNumeriques')}
          ${jusquAu === null ? Prisma.empty : Prisma.sql`AND DATE(act.date) <= ${jusquAu}::date`}
        AND ${codeDepartementSql} IS NOT NULL
      GROUP BY ${codeDepartementSql}
  `

  return departements.map(({ code, nom }) => ({
    departement: { code: CodeDepartement(code), nom: NomDepartement(nom) },
    accompagnements: NombreDAccompagnements(
      comptes.find((compte) => compte.departement === code)?.count ?? 0,
    ),
  }))
}
