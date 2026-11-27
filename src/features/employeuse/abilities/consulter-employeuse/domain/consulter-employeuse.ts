import { type Result, success } from '@/libraries/result'
import type { EmployeuseId } from '../../../domain/employeuse-id'
import type {
  EmployeuseConsultee,
  PersonneEmployee,
} from './employeuse-consultee'
import type { ConsulterEmployeusePorts } from './ports'

const premiereFois = (
  personne: PersonneEmployee,
  index: number,
  personnes: readonly PersonneEmployee[],
): boolean =>
  personnes.findIndex(
    ({ utilisateurId }) => utilisateurId === personne.utilisateurId,
  ) === index

export const consulterEmployeuse =
  ({ lireLEmployeuse }: ConsulterEmployeusePorts) =>
  async ({
    employeuseId,
  }: {
    readonly employeuseId: EmployeuseId
  }): Promise<Result<EmployeuseConsultee | null, never>> => {
    const lue = await lireLEmployeuse(employeuseId)

    if (lue === null) return success(null)

    return success({
      employeuse: lue.employeuse,
      personnesEmployees: lue.affectations
        .flatMap(({ personne }) => (personne === null ? [] : [personne]))
        .filter(premiereFois),
    })
  }
