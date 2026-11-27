import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { EmployeuseConsultee } from './employeuse-consultee'

export type ConsulterEmployeuse = (input: {
  readonly employeuseId: EmployeuseId
}) => Promise<EmployeuseConsultee | null>

export type NomDeLEmployeuse = (id: EmployeuseId) => Promise<string | null>
