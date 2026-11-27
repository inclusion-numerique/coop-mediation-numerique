import type { Departement } from '@/libraries/departement'
import { failure, type Result, success } from '@/libraries/result'
import { DepartementInconnu, situerLesCoordinateurs } from '../../../domain'
import type { ActeursDuDepartement } from './acteurs-du-departement'
import type { CriteresActeurs } from './criteres-acteurs'
import type { EchecDeListerLesActeursDuDepartement } from './errors'
import type { ListerLesActeursDuDepartementPorts } from './ports'

export const listerLesActeursDuDepartement =
  <Communes>({
    acteursDuDepartement,
    communesDesLieux,
  }: ListerLesActeursDuDepartementPorts<Communes>) =>
  async ({
    departement,
    criteres,
  }: {
    readonly departement: Departement | null
    readonly criteres: CriteresActeurs
  }): Promise<
    Result<ActeursDuDepartement<Communes>, EchecDeListerLesActeursDuDepartement>
  > => {
    if (departement === null) return failure(DepartementInconnu())

    const [lus, communes] = await Promise.all([
      acteursDuDepartement(departement.code, criteres),
      communesDesLieux({ departementCode: departement.code }),
    ])

    return success({
      departement,
      criteres,
      acteurs: { ...lus, items: lus.items.map(situerLesCoordinateurs) },
      communes,
    })
  }
