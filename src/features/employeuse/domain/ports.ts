import type { EmploiActuelLu } from './consultation/emploi-lu'
import type { Employeuse } from './employeuse'
import type { UtilisateurId } from './utilisateur-id'

export type RechercherEmployeuse = (input: {
  readonly recherche: string
  readonly limite: number
}) => Promise<{
  readonly employeuses: readonly Employeuse[]
  readonly total: number
}>

export type LireLEmploiActuel = (
  utilisateurId: UtilisateurId,
) => Promise<EmploiActuelLu | null>
