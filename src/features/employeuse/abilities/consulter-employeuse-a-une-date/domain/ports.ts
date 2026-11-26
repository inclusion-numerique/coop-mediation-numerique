import type { Employeuse } from '../../../domain/employeuse'

export type ConsulterEmployeuseAUneDate = (input: {
  userId: string
  date: Date
}) => Promise<Employeuse | null>
