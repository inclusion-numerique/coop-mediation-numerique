import type { Departement } from '@/libraries/departement'
import { failure, type Result, success } from '@/libraries/result'
import { DepartementInconnu } from '../../../domain'
import type { CriteresDesLieux } from './criteres-des-lieux'
import type { EchecDeConsulterLesLieuxDuDepartement } from './errors'
import type { LieuxConsultes } from './lieux-consultes'
import type { ConsulterLesLieuxDuDepartementPorts } from './ports'

export const consulterLesLieuxDuDepartement =
  <Lieux, Communes>({
    lieuxDuDepartement,
    communesDesLieux,
  }: ConsulterLesLieuxDuDepartementPorts<Lieux, Communes>) =>
  async ({
    departement,
    criteres,
  }: {
    readonly departement: Departement | null
    readonly criteres: CriteresDesLieux
  }): Promise<
    Result<
      LieuxConsultes<Lieux, Communes>,
      EchecDeConsulterLesLieuxDuDepartement
    >
  > => {
    if (departement === null) return failure(DepartementInconnu())

    const [lieux, communes] = await Promise.all([
      lieuxDuDepartement({ departementCode: departement.code, criteres }),
      communesDesLieux({ departementCode: departement.code }),
    ])

    return success({
      departement,
      criteres,
      lieux,
      communes,
    })
  }
