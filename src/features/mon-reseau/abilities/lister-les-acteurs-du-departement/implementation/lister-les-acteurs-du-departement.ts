import {
  type DepartementInconnu,
  departementDuCode,
} from '@app/web/libraries/departement'
import { failure, success } from '@app/web/libraries/result'
import { criteresActeurs, type ParametresDesActeurs } from '../domain'
import { communesDuDepartement } from './lieux-activite'
import { acteursDuDepartement } from './prisma'

export const listerLesActeursDuDepartement = async (
  code: string,
  parametres: ParametresDesActeurs,
) => {
  const departement = departementDuCode(code)

  if (!departement.success)
    return failure<DepartementInconnu>(departement.error)

  const criteres = criteresActeurs(parametres)
  const [acteurs, communes] = await Promise.all([
    acteursDuDepartement(departement.data.code, criteres),
    communesDuDepartement(departement.data.code),
  ])

  return success({ departement: departement.data, criteres, acteurs, communes })
}

export type ActeursDuDepartementConsultes = Extract<
  Awaited<ReturnType<typeof listerLesActeursDuDepartement>>,
  { success: true }
>['data']
