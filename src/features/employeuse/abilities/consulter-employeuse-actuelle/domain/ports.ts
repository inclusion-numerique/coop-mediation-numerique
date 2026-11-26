import type { EmployeuseActuelle } from '../../../domain/consultation/employeuse-actuelle'

export type ConsulterEmployeuseActuelle = (input: {
  userId: string
}) => Promise<EmployeuseActuelle | null>
