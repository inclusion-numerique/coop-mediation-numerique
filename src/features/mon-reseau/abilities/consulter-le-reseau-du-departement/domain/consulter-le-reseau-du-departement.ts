import type { Departement } from '@/libraries/departement'
import { failure, type Result, success } from '@/libraries/result'
import { DepartementInconnu } from '../../../domain'
import type { EchecDeConsulterLeReseauDuDepartement } from './errors'
import type { ConsulterLeReseauDuDepartementPorts } from './ports'
import type { ReseauDuDepartement } from './reseau-du-departement'

export const consulterLeReseauDuDepartement =
  ({
    compterLesActeursDuDepartement,
    nombreDeLieuxDuDepartement,
  }: ConsulterLeReseauDuDepartementPorts) =>
  async ({
    departement,
  }: {
    readonly departement: Departement | null
  }): Promise<
    Result<ReseauDuDepartement, EchecDeConsulterLeReseauDuDepartement>
  > => {
    if (departement === null) return failure(DepartementInconnu())

    const [acteurs, lieux] = await Promise.all([
      compterLesActeursDuDepartement(departement.code),
      nombreDeLieuxDuDepartement(departement.code),
    ])

    return success({ departement, acteurs, lieux })
  }
