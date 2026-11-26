import type { EmployeuseHistorique } from '../../../domain/consultation/employeuses-historique'

export type ConsulterHistoriqueEmployeuses = (input: {
  userId: string
}) => Promise<EmployeuseHistorique[]>
