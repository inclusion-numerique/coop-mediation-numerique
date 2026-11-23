import type { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import type { CompteAReaffecter, PlanDeChangement } from './plan-de-changement'

export type ChangerLesRolesPorts = {
  readonly lireLeCompteAReaffecter: (
    utilisateurId: string,
  ) => Promise<CompteAReaffecter | null>
  readonly appliquerLePlan: (
    utilisateurId: UtilisateurId,
    plan: PlanDeChangement,
  ) => Promise<void>
  readonly journaliserLeChangement: (changement: {
    readonly utilisateurId: UtilisateurId
    readonly auteurId: AuteurId | null
    readonly plan: PlanDeChangement
  }) => void
}
