import {
  type DepartementInconnu,
  departementDuCode,
} from '@app/web/libraries/departement'
import { failure, success } from '@app/web/libraries/result'
import { criteresDesLieux, type ParametresDesLieux } from '../domain'
import { lieuxEtCommunesDuDepartement } from './lieux-activite'

export const consulterLesLieuxDuDepartement = async (
  code: string,
  parametres: ParametresDesLieux,
) => {
  const departement = departementDuCode(code)

  if (!departement.success)
    return failure<DepartementInconnu>(departement.error)

  const criteres = criteresDesLieux(parametres)

  return success({
    departement: departement.data,
    criteres,
    ...(await lieuxEtCommunesDuDepartement(departement.data.code, criteres)),
  })
}

export type LieuxDuDepartementConsultes = Extract<
  Awaited<ReturnType<typeof consulterLesLieuxDuDepartement>>,
  { success: true }
>['data']
