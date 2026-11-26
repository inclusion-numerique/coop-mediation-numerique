import type { Employeuse } from './employeuse'

export type RechercherEmployeuse = (input: {
  recherche: string
  limite?: number
}) => Promise<{
  employeuses: Employeuse[]
  total: number
}>
