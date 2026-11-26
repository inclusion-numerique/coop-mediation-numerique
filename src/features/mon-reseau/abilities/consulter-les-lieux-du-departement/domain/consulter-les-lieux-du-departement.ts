import { departementDuCode } from '@/libraries/departement'
import { type Result, success } from '@/libraries/result'
import type { CriteresDesLieux } from './criteres-des-lieux'
import type { EchecDeConsulterLesLieuxDuDepartement } from './errors'
import type { LieuxConsultes } from './lieux-consultes'
import type { ConsulterLesLieuxDuDepartementPorts } from './ports'

export const consulterLesLieuxDuDepartement =
  <Lieux>({
    lieuxDuDepartement,
    communesDesLieux,
  }: ConsulterLesLieuxDuDepartementPorts<Lieux>) =>
  async ({
    code,
    criteres,
  }: {
    readonly code: string
    readonly criteres: CriteresDesLieux
  }): Promise<
    Result<LieuxConsultes<Lieux>, EchecDeConsulterLesLieuxDuDepartement>
  > => {
    const departement = departementDuCode(code)

    if (!departement.success) return departement

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
