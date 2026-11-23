import {
  type DepartementInconnu,
  departementDuCode,
} from '@/libraries/departement'
import { failure, type Result, success } from '@/libraries/result'
import { Effectif } from '../../../../domain'
import type {
  NombreDeLieuxDuDepartement,
  ReseauDuDepartement,
} from '../../domain'
import { compterLesActeursDuDepartement } from '.'

export const consulterLeReseauDuDepartement = async (
  code: string,
  {
    nombreDeLieuxDuDepartement,
  }: { nombreDeLieuxDuDepartement: NombreDeLieuxDuDepartement },
): Promise<Result<ReseauDuDepartement, DepartementInconnu>> => {
  const departement = departementDuCode(code)

  if (!departement.success) return failure(departement.error)

  const [acteurs, lieux] = await Promise.all([
    compterLesActeursDuDepartement(departement.data.code),
    nombreDeLieuxDuDepartement(departement.data.code).then(Effectif),
  ])

  return success({ departement: departement.data, acteurs, lieux })
}
