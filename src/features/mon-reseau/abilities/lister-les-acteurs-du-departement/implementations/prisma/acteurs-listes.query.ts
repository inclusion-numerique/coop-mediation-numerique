import {
  type DepartementInconnu,
  departementDuCode,
} from '@/libraries/departement'
import { failure, success } from '@/libraries/result'
import { type CommunesDesLieux, type CriteresActeurs } from '../../domain'
import { acteursDuDepartement } from '.'

export const listerLesActeursDuDepartement = async (
  code: string,
  criteres: CriteresActeurs,
  { communesDesLieux }: { communesDesLieux: CommunesDesLieux },
) => {
  const departement = departementDuCode(code)

  if (!departement.success)
    return failure<DepartementInconnu>(departement.error)

  const [acteurs, { communesOptions: communes }] = await Promise.all([
    acteursDuDepartement(departement.data.code, criteres),
    communesDesLieux({ departementCode: departement.data.code }),
  ])

  return success({ departement: departement.data, criteres, acteurs, communes })
}
