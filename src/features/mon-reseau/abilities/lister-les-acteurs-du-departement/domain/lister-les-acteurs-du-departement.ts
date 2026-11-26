import { departementDuCode } from '@/libraries/departement'
import { type Result, success } from '@/libraries/result'
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
    code,
    criteres,
  }: {
    readonly code: string
    readonly criteres: CriteresActeurs
  }): Promise<
    Result<ActeursDuDepartement, EchecDeListerLesActeursDuDepartement>
  > => {
    const departement = departementDuCode(code)

    if (!departement.success) return departement

    const [acteurs, { communesOptions }] = await Promise.all([
      acteursDuDepartement(departement.data.code, criteres),
      communesDesLieux({ departementCode: departement.data.code }),
    ])

    return success({
      departement: departement.data,
      criteres,
      acteurs,
      communes: communesOptions,
    })
  }
