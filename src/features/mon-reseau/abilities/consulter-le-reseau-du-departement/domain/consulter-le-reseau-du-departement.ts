import { departementDuCode } from '@/libraries/departement'
import { type Result, success } from '@/libraries/result'
import { Effectif } from '../../../domain'
import type { EchecDeConsulterLeReseauDuDepartement } from './errors'
import type { ConsulterLeReseauDuDepartementPorts } from './ports'
import type { ReseauDuDepartement } from './reseau-du-departement'

export const consulterLeReseauDuDepartement =
  ({
    compterLesActeursDuDepartement,
    nombreDeLieuxDuDepartement,
  }: ConsulterLeReseauDuDepartementPorts) =>
  async ({
    code,
  }: {
    readonly code: string
  }): Promise<
    Result<ReseauDuDepartement, EchecDeConsulterLeReseauDuDepartement>
  > => {
    const departement = departementDuCode(code)

    if (!departement.success) return departement

    const [acteurs, lieux] = await Promise.all([
      compterLesActeursDuDepartement(departement.data.code),
      nombreDeLieuxDuDepartement(departement.data.code),
    ])

    return success({
      departement: departement.data,
      acteurs,
      lieux: Effectif(lieux),
    })
  }
