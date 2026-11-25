import {
  type DepartementInconnu,
  departementDuCode,
} from '@/libraries/departement'
import { failure, success } from '@/libraries/result'
import {
  type CommunesDesLieux,
  type CriteresDesLieux,
  type LieuxDuDepartement,
} from '.'

export const consulterLesLieuxDuDepartement = async <Lieux>(
  code: string,
  criteres: CriteresDesLieux,
  {
    lieuxDuDepartement,
    communesDesLieux,
  }: {
    lieuxDuDepartement: LieuxDuDepartement<Lieux>
    communesDesLieux: CommunesDesLieux
  },
) => {
  const departement = departementDuCode(code)

  if (!departement.success)
    return failure<DepartementInconnu>(departement.error)

  const [lieux, { communesOptions }] = await Promise.all([
    lieuxDuDepartement({ departementCode: departement.data.code, criteres }),
    communesDesLieux({ departementCode: departement.data.code }),
  ])

  return success({
    departement: departement.data,
    criteres,
    lieux,
    communes: communesOptions,
  })
}
