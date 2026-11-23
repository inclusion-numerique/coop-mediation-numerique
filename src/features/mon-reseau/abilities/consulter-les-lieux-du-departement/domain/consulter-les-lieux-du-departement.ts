import {
  type DepartementInconnu,
  departementDuCode,
} from '@/libraries/departement'
import { failure, success } from '@/libraries/result'
import {
  type CommunesDesLieux,
  criteresDesLieux,
  type LieuxDuDepartement,
  type ParametresDesLieux,
} from '.'

export const consulterLesLieuxDuDepartement = async <Lieux>(
  code: string,
  parametres: ParametresDesLieux,
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

  const criteres = criteresDesLieux(parametres)
  const { recherche, communes, tri, page, lignes } = criteres
  const [lieux, { communesOptions }] = await Promise.all([
    lieuxDuDepartement({
      departementCode: departement.data.code,
      searchParams: {
        recherche: recherche ?? undefined,
        communes,
        tri,
        page: String(page),
        lignes: String(lignes),
      },
    }),
    communesDesLieux({ departementCode: departement.data.code }),
  ])

  return success({
    departement: departement.data,
    criteres,
    lieux,
    communes: communesOptions,
  })
}
