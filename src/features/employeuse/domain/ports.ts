import type { EmploiActuelLu } from './consultation/emploi-lu'
import type { Employeuse } from './employeuse'
import type { UtilisateurId } from './utilisateur-id'

export type RechercherEmployeuse = (input: {
  recherche: string
  limite?: number
}) => Promise<{
  employeuses: Employeuse[]
  total: number
}>

export type LireLEmploiActuel = (
  utilisateurId: UtilisateurId,
) => Promise<EmploiActuelLu | null>
