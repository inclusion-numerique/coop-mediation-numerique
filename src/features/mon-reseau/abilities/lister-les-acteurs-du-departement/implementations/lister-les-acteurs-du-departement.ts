import {
  type DepartementInconnu,
  departementDuCode,
} from '@/libraries/departement'
import { failure, success } from '@/libraries/result'
import {
  type CommunesDesLieux,
  criteresActeurs,
  type ParametresDesActeurs,
} from '../domain'
import { acteursDuDepartement } from './prisma'

export const listerLesActeursDuDepartement = async (
  code: string,
  parametres: ParametresDesActeurs,
  { communesDesLieux }: { communesDesLieux: CommunesDesLieux },
) => {
  const departement = departementDuCode(code)

  if (!departement.success)
    return failure<DepartementInconnu>(departement.error)

  const criteres = criteresActeurs(parametres)
  const [acteurs, { communesOptions: communes }] = await Promise.all([
    acteursDuDepartement(departement.data.code, criteres),
    communesDesLieux({ departementCode: departement.data.code }),
  ])

  return success({ departement: departement.data, criteres, acteurs, communes })
}
