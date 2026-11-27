import type { Employeuse } from '../../../domain/employeuse'
import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { PersonneEmployee } from './employeuse-consultee'

export type EmployeuseLue = {
  readonly employeuse: Employeuse
  readonly affectations: readonly {
    readonly personne: PersonneEmployee | null
  }[]
}

export type LireLEmployeuse = (
  employeuseId: EmployeuseId,
) => Promise<EmployeuseLue | null>

export type ConsulterEmployeusePorts = {
  readonly lireLEmployeuse: LireLEmployeuse
}

export type NomDeLEmployeuse = (id: EmployeuseId) => Promise<string | null>
