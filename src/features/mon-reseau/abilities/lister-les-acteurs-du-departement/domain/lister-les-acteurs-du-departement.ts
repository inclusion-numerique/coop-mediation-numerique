import type { Departement } from '@/libraries/departement'
import { failure, type Result, success } from '@/libraries/result'
import { DepartementInconnu } from '../../../domain'
import type { ActeursDuDepartement } from './acteurs-du-departement'
import type { CriteresActeurs } from './criteres-acteurs'
import type { EchecDeListerLesActeursDuDepartement } from './errors'
import type { ListerLesActeursDuDepartementPorts } from './ports'

export const listerLesActeursDuDepartement =
  ({
    acteursDuDepartement,
    communesDesLieux,
  }: ListerLesActeursDuDepartementPorts) =>
  async ({
    departement,
    criteres,
  }: {
    readonly departement: Departement | null
    readonly criteres: CriteresActeurs
  }): Promise<
    Result<ActeursDuDepartement, EchecDeListerLesActeursDuDepartement>
  > => {
    if (departement === null) return failure(DepartementInconnu())

    const [acteurs, { communesOptions }] = await Promise.all([
      acteursDuDepartement(departement.code, criteres),
      communesDesLieux({ departementCode: departement.code }),
    ])

    return success({
      departement,
      criteres,
      acteurs,
      communes: communesOptions,
    })
  }
