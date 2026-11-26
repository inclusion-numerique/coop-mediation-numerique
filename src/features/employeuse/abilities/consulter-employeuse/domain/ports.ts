import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { EmployeuseConsultee } from './employeuse-consultee'

export type ConsulterEmployeuse = (input: {
  employeuseId: EmployeuseId
}) => Promise<EmployeuseConsultee | null>

export type NomDeLEmployeuse = (id: number) => Promise<string | null>
