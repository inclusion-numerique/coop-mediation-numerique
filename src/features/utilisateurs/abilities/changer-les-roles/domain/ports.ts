import type { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import type { CompteAReaffecter, PlanDeChangement } from './plan-de-changement'

export type LireLeCompteAReaffecter = (
  utilisateurId: string,
) => Promise<CompteAReaffecter | null>

export type AppliquerLePlan = (
  utilisateurId: UtilisateurId,
  plan: PlanDeChangement,
) => Promise<void>

export type JournaliserLeChangement = (changement: {
  readonly utilisateurId: UtilisateurId
  readonly auteurId: AuteurId | null
  readonly plan: PlanDeChangement
}) => void

export type RolesVacants = {
  readonly coordinateursVacants: readonly UtilisateurId[]
  readonly mediateursVacants: readonly UtilisateurId[]
}

export type LireLesRolesVacants = (maintenant: Date) => Promise<RolesVacants>

export type ChangerLesRolesPorts = {
  readonly lireLeCompteAReaffecter: LireLeCompteAReaffecter
  readonly appliquerLePlan: AppliquerLePlan
  readonly journaliserLeChangement: JournaliserLeChangement
}

export type RetirerLesRolesVacantsPorts = ChangerLesRolesPorts & {
  readonly lireLesRolesVacants: LireLesRolesVacants
}
