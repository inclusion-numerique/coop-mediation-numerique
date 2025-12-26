import {
  Departement,
  departementsByCode,
} from '@app/web/data/collectivites-territoriales/departements'
import { prismaClient } from '@app/web/prismaClient'
import { departementCodeFromInseeRegex } from './departementCodeFromInseeRegex'

/**
 * Count distinct users who are acteurs in a department:
 * - Users with an active EmployeStructure to a structure in the department
 * - OR users with an active MediateurEnActivite to a structure in the department
 */
const countActeursInDepartement = ({
  departementCode,
}: {
  departementCode: string
}) =>
  prismaClient.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT u.id)::integer AS count
    FROM users u
    LEFT JOIN employes_structures es ON es.user_id = u.id AND es.suppression IS NULL AND es.fin_emploi IS NULL
    LEFT JOIN structures s1 ON s1.id = es.structure_id
    LEFT JOIN mediateurs m ON m.user_id = u.id
    LEFT JOIN mediateurs_en_activite mea ON mea.mediateur_id = m.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
    LEFT JOIN structures s2 ON s2.id = mea.structure_id
    WHERE u.deleted IS NULL
      AND u.inscription_validee IS NOT NULL
      AND (
        SUBSTRING(s1.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
        OR SUBSTRING(s2.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      )
  `

/**
 * Count structures (lieux) in a department
 */
const countLieuxInDepartement = ({
  departementCode,
}: {
  departementCode: string
}) =>
  prismaClient.$queryRaw<[{ count: number }]>`
    SELECT COUNT(*)::integer AS count
    FROM structures
    WHERE suppression IS NULL
      AND SUBSTRING(code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
  `

export type MonReseauPageData = {
  departement: Departement
  acteursCount: number
  lieuxCount: number
}

export const getMonReseauPageData = async ({
  departementCode,
}: {
  departementCode: string
}): Promise<MonReseauPageData> => {
  const departement = departementsByCode.get(departementCode)

  if (!departement) {
    throw new Error(`Département inconnu : ${departementCode}`)
  }

  const [acteursResult, lieuxResult] = await Promise.all([
    countActeursInDepartement({ departementCode }),
    countLieuxInDepartement({ departementCode }),
  ])

  return {
    departement,
    acteursCount: acteursResult[0]?.count ?? 0,
    lieuxCount: lieuxResult[0]?.count ?? 0,
  }
}
