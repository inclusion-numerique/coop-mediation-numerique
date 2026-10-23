import {
  type DepartementInconnu,
  departementDuCode,
} from '@app/web/libraries/departement'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { ReseauDuDepartement } from '../domain'
import { compterLesLieuxDuDepartement } from './lieux-activite'
import { compterLesActeursDuDepartement } from './prisma'

export const consulterLeReseauDuDepartement = async (
  code: string,
): Promise<Result<ReseauDuDepartement, DepartementInconnu>> => {
  const departement = departementDuCode(code)

  if (!departement.success) return failure(departement.error)

  const [acteurs, lieux] = await Promise.all([
    compterLesActeursDuDepartement(departement.data.code),
    compterLesLieuxDuDepartement(departement.data.code),
  ])

  return success({ departement: departement.data, acteurs, lieux })
}
